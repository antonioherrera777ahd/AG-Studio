import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Determine environment
const distPath = path.resolve(__dirname, 'dist');
const hasDist = fs.existsSync(distPath);
const isDev =
  process.env.NODE_ENV === 'development' ||
  process.argv.includes('--port') ||
  process.env.npm_lifecycle_event === 'dev';
const isProd = !isDev && (process.env.NODE_ENV === 'production' || hasDist);

// Port: In dev, MUST be 3000 (per environment constraints).
// In production deployment, use process.env.PORT if provided.
function getPort(): number {
  if (isDev) {
    const portArgIdx = process.argv.indexOf('--port');
    if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
      return parseInt(process.argv[portArgIdx + 1], 10);
    }
    return 3000;
  }
  return process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
}

const port = getPort();

app.use(express.json({ limit: '10mb' }));

// Helper to get or initialize Google GenAI client dynamically
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY no está configurada en las variables de entorno del servidor. Por favor, asegúrate de asignarla en el panel de Secretos.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseGeminiError(err: unknown): { status: number; message: string; isRetryable: boolean } {
  let status = 500;
  let rawMessage = err instanceof Error ? err.message : String(err || 'Error desconocido');

  // @google/genai errors sometimes include a JSON payload in err.message or err.status
  const errObj = err as { status?: number; code?: number; message?: string };
  if (typeof errObj?.status === 'number') status = errObj.status;
  else if (typeof errObj?.code === 'number') status = errObj.code;

  // Try to parse embedded JSON like {"error":{"code":503,"message":"...","status":"UNAVAILABLE"}}
  const jsonMatch = rawMessage.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const nested = parsed?.error || parsed;
      if (typeof nested?.code === 'number') status = nested.code;
      if (typeof nested?.message === 'string') rawMessage = nested.message;
    } catch {
      // Ignore JSON parse errors on message text
    }
  }

  const lower = rawMessage.toLowerCase();
  const isTimeout =
    (err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')) ||
    lower.includes('timeout') ||
    lower.includes('aborted');

  const isRetryable =
    isTimeout ||
    status === 503 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 504 ||
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('overloaded') ||
    lower.includes('rate limit') ||
    lower.includes('econnreset') ||
    lower.includes('etimedout');

  let friendlyMessage = rawMessage;
  if (isTimeout) {
    status = 504;
    friendlyMessage =
      'El modelo de IA tardó demasiado en responder. Por favor, pulsa «Reintentar».';
  } else if (status === 503 || lower.includes('high demand') || lower.includes('unavailable')) {
    friendlyMessage =
      'El servicio de IA está experimentando un pico temporal de demanda (503). Se reintentó automáticamente sin éxito; por favor, pulsa «Reintentar» en unos segundos.';
  } else if (status === 429) {
    friendlyMessage =
      'Se ha alcanzado temporalmente el límite de solicitudes de la API (429). Espera unos segundos y pulsa «Reintentar».';
  } else if (status === 403 || status === 401 || lower.includes('api key') || lower.includes('permission_denied')) {
    friendlyMessage =
      'Error de permisos o clave de API inválida. Revisa la configuración de GEMINI_API_KEY en Settings > Secrets.';
  }

  return { status, message: friendlyMessage, isRetryable };
}

function normalizeContents(
  messages: Array<{ role: string; content: string; speakerName?: string }>,
  includeSpeakerPrefix = false
) {
  const formatted: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const m of messages) {
    const text = (
      includeSpeakerPrefix && m.speakerName ? `[${m.speakerName}]: ${m.content}` : m.content
    ).trim();
    if (!text) continue;

    const role: 'user' | 'model' = m.role === 'assistant' || m.role === 'model' ? 'model' : 'user';
    const prev = formatted[formatted.length - 1];
    if (prev && prev.role === role) {
      prev.parts[0].text += `\n\n${text}`;
    } else {
      formatted.push({ role, parts: [{ text }] });
    }
  }

  // Gemini generateContent expects the conversation to start with a user turn when possible;
  // if it starts with the character's initial greeting ('model'), prepend a brief user turn context or merge cleanly.
  if (formatted.length > 0 && formatted[0].role === 'model') {
    formatted.unshift({
      role: 'user',
      parts: [{ text: '(Inicio de la reunión en la sala de juntas de AG Telecomunicaciones)' }],
    });
  }

  return formatted;
}

let primaryCooldownUntil = 0;
const PRIMARY_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: unknown;
    systemInstruction?: string;
    responseMimeType?: string;
  }
) {
  const now = Date.now();
  const skipPrimary = now < primaryCooldownUntil;

  const attempts: Array<{ model: string; delayMs: number; timeoutMs: number }> = skipPrimary
    ? [
        { model: FALLBACK_MODEL, delayMs: 0, timeoutMs: 12000 },
        { model: FALLBACK_MODEL, delayMs: 600, timeoutMs: 12000 },
        { model: PRIMARY_MODEL, delayMs: 300, timeoutMs: 10000 },
      ]
    : [
        { model: PRIMARY_MODEL, delayMs: 0, timeoutMs: 7500 },
        { model: PRIMARY_MODEL, delayMs: 400, timeoutMs: 7500 },
        { model: FALLBACK_MODEL, delayMs: 200, timeoutMs: 12000 },
        { model: FALLBACK_MODEL, delayMs: 800, timeoutMs: 12000 },
      ];

  let lastErr: unknown;

  for (let i = 0; i < attempts.length; i++) {
    const { model, delayMs, timeoutMs } = attempts[i];
    if (delayMs > 0) {
      const jitter = Math.floor(Math.random() * 150);
      await sleep(delayMs + jitter);
    }

    const t0 = Date.now();
    try {
      const thinkingLevel =
        model === FALLBACK_MODEL ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW;

      const response = await ai.models.generateContent({
        model,
        contents: params.contents as Parameters<typeof ai.models.generateContent>[0]['contents'],
        config: {
          abortSignal: AbortSignal.timeout(timeoutMs),
          thinkingConfig: { thinkingLevel },
          ...(params.systemInstruction ? { systemInstruction: params.systemInstruction } : {}),
          ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
        },
      });

      if (model === PRIMARY_MODEL) {
        primaryCooldownUntil = 0;
      }
      console.log(`[AG STUDIO] Model ${model} succeeded in ${Date.now() - t0}ms (attempt ${i + 1})`);
      return { response, modelUsed: model };
    } catch (err) {
      lastErr = err;
      const parsed = parseGeminiError(err);
      console.warn(
        `[AG STUDIO] Attempt ${i + 1}/${attempts.length} with model ${model} failed in ${Date.now() - t0}ms (${parsed.status}): ${parsed.message}`
      );
      if (!parsed.isRetryable) {
        throw err;
      }

      if (model === PRIMARY_MODEL) {
        primaryCooldownUntil = Date.now() + PRIMARY_COOLDOWN_MS;
        // If primary timed out (504), don't waste another 7.5s retrying primary—jump directly to fallback
        if (parsed.status === 504 && attempts[i + 1]?.model === PRIMARY_MODEL) {
          i++;
        }
      }
    }
  }

  throw lastErr;
}

// Health & Status check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: PRIMARY_MODEL,
    fallbackModel: FALLBACK_MODEL,
    app: 'AG STUDIO — AG Telecomunicaciones',
    status: 'online',
    isProd,
    isDev,
    port,
  });
});

// Single character chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const ai = getGenAIClient();
    const { systemInstruction, messages, characterName } = req.body;

    if (!systemInstruction || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (systemInstruction, messages).' });
    }

    const contents = normalizeContents(messages, false);

    const { response, modelUsed } = await generateWithRetryAndFallback(ai, {
      contents,
      systemInstruction,
    });

    const reply =
      response.text || '(El interlocutor asiente en silencio y espera vuestra siguiente intervención.)';

    return res.json({ reply, characterName, modelUsed });
  } catch (err: unknown) {
    console.error('Error in /api/chat:', err);
    const { status, message } = parseGeminiError(err);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

// Duo chat endpoint (two professionals in a joint meeting)
app.post('/api/chat-duo', async (req, res) => {
  try {
    const ai = getGenAIClient();
    const { systemInstruction, messages, character1, character2 } = req.body;

    if (!systemInstruction || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    const contents = normalizeContents(messages, true);

    const { response, modelUsed } = await generateWithRetryAndFallback(ai, {
      contents,
      systemInstruction,
    });

    const reply =
      response.text || '(Ambos profesionales revisan sus notas y esperan vuestra siguiente intervención.)';
    return res.json({ reply, character1, character2, modelUsed });
  } catch (err: unknown) {
    console.error('Error in /api/chat-duo:', err);
    const { status, message } = parseGeminiError(err);
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

// Handover summary generator
app.post('/api/summarize-handover', async (req, res) => {
  try {
    const ai = getGenAIClient();
    const {
      fromCharacterName,
      fromCharacterRole,
      toCharacterName,
      toCharacterRole,
      activityTitle,
      transcript,
    } = req.body;

    const prompt = `
Eres el sistema de coordinación de personal de AG Telecomunicaciones.
Genera un acta formal y ejecutiva de derivación (handover) entre departamentos para transferir a los estudiantes de una reunión a otra.

Datos de la reunión:
- Empleado de origen: ${fromCharacterName} (${fromCharacterRole})
- Empleado de destino: ${toCharacterName} (${toCharacterRole})
- Actividad en curso: ${activityTitle || 'Consulta general'}

Transcripción de la reunión anterior:
"""
${transcript}
"""

Redacta un JSON estricto con esta estructura exacta (sin formato markdown de código, solo texto JSON puro):
{
  "summary": "Resumen conciso en 2 frases de lo que se trató.",
  "objective": "Objetivo principal que el grupo debe resolver ahora con ${toCharacterName}.",
  "decisionsAdopted": ["Decisión 1 acordada en la reunión previa", "Decisión 2..."],
  "proposalsPresented": ["Propuesta o planteamiento del grupo...", "..."],
  "problemsDetected": ["Objeción, limitación o fallo detectado en la reunión...", "..."],
  "pendingQuestions": ["Pregunta o encargo específico para ${toCharacterName}...", "..."],
  "handoverGreeting": "Frase breve y natural en tono conversacional con la que ${toCharacterName} debe recibir al equipo haciendo referencia explícita a lo que le ha dicho ${fromCharacterName}."
}
`;

    const { response } = await generateWithRetryAndFallback(ai, {
      contents: prompt,
      responseMimeType: 'application/json',
    });

    const jsonText = (response.text ?? '{}').trim();
    const data = JSON.parse(jsonText);
    return res.json({ handover: data });
  } catch (err: unknown) {
    console.error('Error generating handover:', err);
    return res.json({
      handover: {
        summary: `Derivación de ${req.body.fromCharacterName || 'compañero'} a ${req.body.toCharacterName || 'especialista'}.`,
        objective: 'Resolver cuestiones técnicas y creativas fuera del alcance del departamento anterior.',
        decisionsAdopted: ['Revisión preliminar realizada.'],
        proposalsPresented: ['Planteamiento inicial del equipo.'],
        problemsDetected: ['Cuestiones fuera de la competencia del departamento anterior.'],
        pendingQuestions: ['Consultar requisitos específicos con el nuevo responsable.'],
        handoverGreeting: `Hola equipo, me comenta ${req.body.fromCharacterName || 'mi compañero'} que venís de hablar con su departamento. ¿En qué os puedo orientar?`,
      },
    });
  }
});

// Setup Frontend Serving: Vite dev middleware in development vs Static files in production
async function setupFrontend() {
  if (isDev) {
    console.log('[AG STUDIO] Development mode: mounting Vite dev middleware on port 3000');
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    // Serve index.html transformed with Vite for SPA routes
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    console.log(`[AG STUDIO] Production mode: serving static files from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`AG STUDIO server listening on http://0.0.0.0:${port} (Mode: ${isDev ? 'Development' : 'Production'})`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

setupFrontend().catch((err) => {
  console.error('[AG STUDIO] Fatal error starting server:', err);
  process.exit(1);
});
