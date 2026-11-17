import { ResourceItem } from '../types';

export const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'res-manual-naming-ag',
    title: 'Manual de Estilo y Naming Corporativo AG',
    author: 'Daniela Escribano & Alberto García',
    description: 'Guía oficial para la creación y validación de nombres de filiales y productos del grupo AG Telecomunicaciones. Contiene directrices de pregnancia fonética, disponibilidad de dominios y protección de las siglas fundacionales.',
    recommendedById: 'daniela-escribano',
    activityIds: ['act-identidad-naming'],
    format: 'Manual',
    status: 'available',
    category: 'Branding e Identidad',
    contentSnippet: `MANUAL DE NAMING CORPORATIVO — AG TELECOMUNICACIONES
1. CRITERIOS LINGÜÍSTICOS:
   - Fonética: Nombres de no más de 3 sílabas con acentuación clara.
   - Evitar homofonías ambiguas o términos con connotaciones negativas en español e inglés.
   - Las siglas "AG" deben figurar como prefijo, sufijo o descriptor principal (ej. AG Cloud, Nexus by AG).
2. VERIFICACIÓN PREVIA:
   - Disponibilidad obligatoria de dominio .com y .es.
   - Búsqueda en la OEPM (Oficina Española de Patentes y Marcas) en la clase Nice correspondiente.
3. CONSEJO DE ALBERTO GARCÍA:
   «Si tengo que pedir que me lo deletreen dos veces por teléfono, el nombre queda descartado ipso facto.»`,
  },
  {
    id: 'res-plantilla-benchmarking',
    title: 'Plantilla Oficial de Benchmarking Competitivo AG',
    author: 'Lola Puente (Cuentas)',
    description: 'Matriz estructurada en formato tabla para comparar hasta 5 competidores en variables clave: propuesta de valor, identidad visual, precios, canales de captación y experiencia digital.',
    recommendedById: 'lola-puente',
    activityIds: ['act-benchmarking-personas'],
    format: 'Ficha técnica',
    status: 'available',
    category: 'Estrategia y Cuentas',
    contentSnippet: `MATRIZ DE BENCHMARKING COMPETITIVO — CUENTAS Y ESTRATEGIA
Campos obligatorios por competidor:
1. Marca y Grupo matriz
2. Propuesta de Valor central (Claim principal)
3. Target demográfico y socioeconómico
4. Canales de comunicación preponderantes (TV, Redes, Exterior, B2B)
5. Puntos fuertes detectados en su diseño / interfaz
6. Fricciones o debilidades detectadas (Oportunidades de entrada para AG)
7. Calificación de usabilidad web (1 al 10)

Nota de Lola Puente: «No os quedéis en capturar pantallas bonitas; analizad qué problemas reales de usuario están resolviendo o ignorando.»`,
  },
  {
    id: 'res-checklist-preflight-pdfx',
    title: 'Checklist Oficial de Control Preflight y Generación de PDF/X',
    author: 'Manolo Tintero (Jefe de Producción)',
    description: 'Guía técnica definitiva para preparar archivos de arte final sin errores de imprenta. Parámetros de PDF/X-1a y PDF/X-4, resolución, sobreimpresiones y ganancia de punto.',
    recommendedById: 'manolo-tintero',
    activityIds: ['act-produccion-arte-final'],
    format: 'Ficha técnica',
    status: 'available',
    category: 'Producción Gráfica',
    contentSnippet: `CHECKLIST DE PREIMPRESIÓN — TALLER DE PRODUCCIÓN AG
Norma obligatoria: Lo sé de muy buena tinta... si no revisas esto, la tirada va a la papelera:
[ ] 1. Modo de color CMYK estricto. ¡Cero objetos o imágenes en RGB!
[ ] 2. Resolución de imágenes: 300 ppp a escala 100%. (Ni 72 ppp estirados ni florituras).
[ ] 3. Sangrado perimetral: mínimo 3 mm con marcas de corte fuera del área viva.
[ ] 4. Textos negros pequeños (hasta 18 pt): 100% K solamente. ¡Jamás rich black de cuatro tintas!
[ ] 5. Tipografías trazadas (vectorizadas) o incrustadas al 100% en el PDF.
[ ] 6. Perfil de salida: ISO Coated v2 (FOGRA39) para estucado o PSO Uncoated para offset.
[ ] 7. Sobreimpresión de negro activada para evitar halos de registro blancos.
[ ] 8. Si usas Pantone, verifica que la plancha aparezca como tinta plana y no convertida a CMYK por error.`,
  },
  {
    id: 'res-guia-portfolio-editorial',
    title: 'Guía Editorial para el Diseño de Portfolios Profesionales',
    author: 'Rebeca Lafuente (Directora Artística)',
    description: 'Metodología para seleccionar, estructurar y jerarquizar los proyectos universitarios en un portfolio de impacto para estudios y agencias creativas.',
    recommendedById: 'rebeca-lafuente-portfolio',
    activityIds: ['act-portfolio-reel'],
    format: 'Guía',
    status: 'available',
    category: 'Desarrollo Profesional',
    contentSnippet: `CURADURÍA DE PORTFOLIO — REBECA LAFUENTE
1. ESTRUCTURA DE CASO DE ESTUDIO (Case Study):
   - Titular y cliente ficticio/real.
   - El Reto: ¿Qué problema de diseño se planteaba? (Máximo 3 líneas).
   - El Proceso: Bocetos, pruebas de color, retículas y descarte de ideas.
   - La Solución: Arte final contextualizado en mockups realistas.
   - Vuestro Rol: Si es trabajo en grupo, especificad qué hizo cada miembro con total honestidad.
2. REGLA DEL 4:
   «Mejor presentar 4 proyectos soberbios y bien contados que 12 ejercicios de clase a medio cocer. El nivel de vuestro portfolio lo marca vuestro peor trabajo mostrado.»`,
  },
  {
    id: 'res-patrones-wcag-accesibilidad',
    title: 'Patrones de Navegación Accesible y Roles WAI-ARIA',
    author: 'Marcos Torres & Martha Mendoza',
    description: 'Guía técnica para estructurar componentes web accesibles (menús desplegables, modales y headers) con foco de teclado y etiquetado para lectores de pantalla.',
    recommendedById: 'marcos-torres',
    activityIds: ['act-menu-web', 'act-header-interactivo'],
    format: 'Ficha técnica',
    status: 'available',
    category: 'Desarrollo y UX',
    contentSnippet: `ACCESIBILIDAD FRONTEND — ESPECIFICACIÓN W3C / ARIA
1. Navegación por teclado:
   - La tecla Tab debe recorrer los enlaces y botones en el orden visual natural del DOM.
   - Los submenús desplegables deben poder abrirse y cerrarse con Enter, Espacio y tecla Esc.
2. Atributos ARIA imprescindibles:
   - aria-expanded="true|false" en los botones que abren menús desplegables.
   - aria-haspopup="menu" para advertir al lector de pantalla.
   - aria-label descriptivo en botones que solo contengan iconos (ej. botón hamburguesa o lupa).
3. Relación de contraste mínima:
   - 4.5:1 para texto normal según nivel AA de WCAG 2.1.
   - Marcos apunta: «Si quitáis el outline de foco por puro capricho estético sin poner una alternativa visible, no os paso la pull request.»`,
  },
  {
    id: 'res-codigo-deontologico-propiedad',
    title: 'Código Deontológico y Derechos de Propiedad Intelectual',
    author: 'Clara Valdivia (Legal y Ética)',
    description: 'Marco ético y legal sobre la autoría de obras de diseño, licencias de tipografías (EULA), uso de banco de imágenes y regulación sobre contenidos sintéticos o generados por IA.',
    recommendedById: 'clara-valdivia',
    activityIds: ['act-codigo-etico'],
    format: 'Guía',
    status: 'available',
    category: 'Legal y Ética',
    contentSnippet: `PRINCIPIOS ÉTICOS Y PROPIEDAD INTELECTUAL — CLARA VALDIVIA
1. DERECHOS DE AUTOR:
   - Toda obra visual original goza de protección desde su fijación en un soporte.
   - Utilizar recursos ajenos sin licencia expresa constituye una infracción legal.
2. LICENCIAS TIPOGRÁFICAS (EULA):
   - Una licencia para escritorio (Desktop) no autoriza la incrustación web (Webfont) ni su uso en apps móviles salvo que se adquiera la extensión correspondiente.
3. INTELIGENCIA ARTIFICIAL GENERATIVA:
   - Transparencia: Los equipos deben documentar cuándo y cómo han usado modelos generativos en sus procesos.
   - No se deben introducir datos de clientes ni secretos empresariales confidenciales en prompts públicos.
   - Advertencia de Clara: «Esto constituye una orientación preventiva de buenas prácticas; para litigios concretos siempre debe realizarse un peritaje legal específico.»`,
  },
  {
    id: 'res-manual-diseno-parametrico',
    title: 'Manual de Diseño Paramétrico e Identidades Generativas',
    author: 'Nicolás Berrocal (Innovación)',
    description: 'Introducción a los sistemas visuales basados en algoritmos, modulaciones matemáticas y logotipos reactivos a variables contextuales para televisión y pantallas táctiles.',
    recommendedById: 'nicolas-berrocal',
    activityIds: ['act-logotipos-generativos'],
    format: 'Manual',
    status: 'available',
    category: 'Innovación y Generativo',
    contentSnippet: `SISTEMAS GENERATIVOS — NICOLÁS BERROCAL
1. ANATOMÍA DE UNA MARCA GENERATIVA:
   - Constantes: Elementos que NUNCA cambian (paleta corporativa restringida, grosor de trazo modular, geometría base).
   - Variables: Factores que mutan con el algoritmo (rotación, densidad de retícula, número de nodos, desfase de fase).
2. ENTRADAS DE DATOS (INPUTS):
   - Tiempo atmosférico, horario de emisión del canal, nivel de decibelios del audio o actividad en redes sociales.
3. RECOMENDACIÓN DE NICOLÁS:
   «El buen diseño generativo no es caos aleatorio; es orden matemático que baila con elegancia.»`,
  },
  {
    id: 'res-guia-espacios-broadcast',
    title: 'Guía Técnica de Espacios de Color y Emisión Broadcast',
    author: 'Rebeca Lafuente & Jaqueline Smith',
    description: 'Especificaciones de normas Rec.709 y BT.2020 para emisión televisiva. Niveles seguros de vídeo, límites de saturación para evitar parpadeos y pruebas de contraste.',
    recommendedById: 'rebeca-lafuente',
    activityIds: ['act-paletas-tv', 'act-branding-canales-tv'],
    format: 'Ficha técnica',
    status: 'available',
    category: 'Color y Pantallas',
    contentSnippet: `COLOR BROADCAST Y NORMAS DE EMISIÓN
- Rango de luminancia legal en vídeo: 16 a 235 (en espacio de 8 bits). El blanco puro (255) y negro (0) pueden provocar distorsión en receptores analógicos o monitores mal regulados.
- Espacio cromático estándar: ITU-R BT.709 (HDTV).
- Precaución con el rojo puro saturado (#FF0000): provoca artefactos de compresión y sangrado cromático en compresión H.264/H.265. Rebajar saturación al 85-90%.`,
  },
  {
    id: 'res-plantilla-guion-storyboard-tv',
    title: 'Plantilla Profesional de Guion Técnico y Storyboard para TV',
    author: 'Jaqueline Smith & David Piqueras',
    description: 'Estructura en dos columnas (Audio / Vídeo) para la preproducción de anuncios comerciales de 20 y 30 segundos, con desglose de planos, voces en off y temporización.',
    recommendedById: 'jaqueline-smith',
    activityIds: ['act-spot-tv', 'act-campana-publicitaria'],
    format: 'Guía',
    status: 'available',
    category: 'Audiovisual y Medios',
    contentSnippet: `GUION TÉCNICO DE SPOT (30 SEGUNDOS) — AG TELEVISIÓN
Estructura recomendada:
- Planos 1 y 2 (0-6s): Gancho inicial. Planteamiento del problema cotidiano o situación emocional.
- Planos 3 y 4 (6-18s): Giro de trama. Aparición del servicio de AG Telecomunicaciones como facilitador.
- Planos 5 y 6 (18-26s): Clímax emocional y disfrute de la solución compartida.
- Plano 7 (26-30s): Cierre de marca. Logotipo animado, claim verbal de Daniela y subtítulo legal obligatorio.`,
  },
  {
    id: 'res-game-ux-hud-principles',
    title: 'Manual de Principios de Game UX e Interfaces HUD',
    author: 'Martha Mendoza (División Videojuegos)',
    description: 'Patrones de interacción lúdica, reducción de carga cognitiva en el jugador, diagramación de interfaces Heads-Up Display (HUD) y legibilidad para monitores y consolas portátiles.',
    recommendedById: 'martha-mendoza-videojuegos',
    activityIds: ['act-interfaces-videojuegos'],
    format: 'Manual',
    status: 'available',
    category: 'Videojuegos y Entretenimiento',
    contentSnippet: `GAME UX & HUD DESIGN — MARTHA MENDOZA
1. Principio de la visión periférica: Los datos críticos (vida, munición) deben poder consultarse con un vistazo de reojo de 100 milisegundos sin desviar la mirada del centro de acción.
2. Contraste adaptativo: El HUD debe proyectar una ligera sombra perimetral o fondo semitransparente para no perderse contra cielos blancos o cuevas oscuras.
3. Feedback multisensorial: Todo botón pulsado en el menú debe ofrecer respuesta visual inmediata (cambio de estado), auditiva (click característico) y, si procede, vibración háptica.`,
  },
  {
    id: 'res-manual-animacion-motion-tv',
    title: 'Manual de Animación y Motion Graphics para Canales Broadcast',
    author: 'David Piqueras',
    description: 'Técnicas avanzadas de animación gráfica en After Effects: curvas de velocidad Bezier, anticipación cinética y despiece de elementos vectoriales para animación a 50 fps.',
    recommendedById: 'david-piqueras',
    activityIds: ['act-animacion-logotipo'],
    format: 'Manual',
    status: 'pending',
    category: 'Motion y Audiovisual',
  },
  {
    id: 'res-normativa-seguridad-onair',
    title: 'Manual de Zonas de Seguridad y Normas On-Air Broadcast',
    author: 'Jaqueline Smith & Rebeca Lafuente',
    description: 'Documento normativo de la Unión Europea de Radiodifusión sobre áreas Action Safe (93%) y Title Safe (90%) para evitar que rótulos queden recortados en televisores con overscan.',
    recommendedById: 'jaqueline-smith',
    activityIds: ['act-branding-canales-tv'],
    format: 'Manual',
    status: 'pending',
    category: 'Audiovisual y Medios',
  },
  {
    id: 'res-catalogo-armonias-digitales',
    title: 'Catálogo de Armonías Cromáticas Digitales AG',
    author: 'Rebeca Lafuente',
    description: 'Muestrario de paletas secundarias calibradas para productos interactivos, plataformas VOD y canales de streaming de alta definición.',
    recommendedById: 'rebeca-lafuente',
    activityIds: ['act-paletas-tv'],
    format: 'Guía',
    status: 'pending',
    category: 'Color y Pantallas',
  },
  {
    id: 'res-manual-soportes-papel-acabados',
    title: 'Manual de Soportes Papeleros, Gramajes y Acabados Especiales',
    author: 'Manolo Tintero',
    description: 'Catálogo físico de papeles estucados mate, brillo, offset volumen, papeles creativos Fedrigoni y técnicas de acabado: barniz selectivo serigráfico, golpe seco y troqueles.',
    recommendedById: 'manolo-tintero',
    activityIds: ['act-produccion-arte-final'],
    format: 'Manual',
    status: 'pending',
    category: 'Producción Gráfica',
  },
];
