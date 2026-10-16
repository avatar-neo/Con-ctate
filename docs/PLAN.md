# Conéctate · Plan de producto y MVP

## Contexto

Conéctate (https://conectatepro.com/) es la red de apoyo mutuo fundada por Angélica Cujar para
transformar emprendedores latinos, muchos migrantes, en empresarios con impacto. Tiene más de 500
miembros activos, 8 años de trayectoria y presencia en el Sur de Florida, Orlando, New York y
Colombia. Hoy la comunidad vive en la web, en un grupo de Facebook, en Instagram (@conectateacc) y
en WhatsApp.

Contacto del grupo: **conectate3g@gmail.com**.

**Objetivo de la app:** un solo lugar en el celular (iOS y Android) para encontrar a otros miembros,
hablar con ellos, enterarse de lo que pasa en la comunidad y darle a Conéctate datos para decidir
mejor.

## Funcionalidades

| Módulo | Qué hace | En el MVP |
|---|---|---|
| **Directorio** | Perfil de cada miembro (nombre, negocio, categoría, ciudad, bio, WhatsApp). Búsqueda y filtros por categoría y ciudad. Cada miembro decide si aparece. | Sí |
| **Chat** | Mensajes uno a uno y grupos, al estilo WhatsApp: tiempo real, leído/no leído, notificaciones push. | Texto 1:1 y grupos; fotos y audios después |
| **Home de noticias** | Noticia del día y resumen semanal en formato blog, con comentarios de los miembros. | Sí |
| **Agente de contenido** | Redacta los borradores de las noticias con IA a partir de las novedades de la comunidad. Un editor revisa y publica. | Sí, con revisión humana obligatoria |
| **Formularios y estadísticas** | Encuestas para recopilar datos de los miembros (ciudad, antigüedad del negocio, intereses de capacitación) y tablero con resultados agregados. | Un formulario de alta y estadísticas básicas |
| **Acceso por suscripción** | Cualquiera descarga la app gratis y se registra, pero solo entra quien tenga la suscripción activa, que se paga en el portal de Conéctate. La app consulta ese estado y no vende nada. | Sí |
| **Administración** | Angélica, como administradora, aprueba miembros, publica noticias y crea formularios. Puede dar rol de editor a otras personas. | Sí, con pantallas dentro de la app |

Fuera del MVP, para fases siguientes: eventos con registro, Zona VIP con contenido premium,
capacitaciones en video, Revista Conecta y CA News dentro de la app.

## Stack recomendado

- **App:** Expo (React Native) con TypeScript y Expo Router. Un solo código para iOS, Android y web,
  y publicación en tiendas con EAS Build/Submit sin necesidad de Mac propia.
- **Backend:** Supabase.
  - Auth: inicio de sesión con correo (enlace mágico) o teléfono.
  - Postgres con Row Level Security: solo los miembros aprobados ven el directorio y el contenido.
  - Realtime para el chat.
  - Storage para fotos de perfil e imágenes de noticias.
  - Edge Functions + cron para el agente de noticias.
- **IA:** Claude API (modelo `claude-opus-5-5`) desde la Edge Function `generate-news`, con salida
  estructurada (título, resumen, cuerpo). Los artículos se guardan como borrador.
- **Notificaciones:** Expo Push Notifications.

**Por qué este stack:** el equipo es pequeño, y Expo + Supabase cubre chat en tiempo real,
autenticación, permisos y funciones programadas sin mantener servidores. El costo inicial es bajo
(los planes gratuitos alcanzan para el piloto) y escala con la comunidad. Firebase sería la
alternativa, pero los formularios y estadísticas se resuelven mejor con SQL.

## Modelo de datos (resumen)

`profiles` (miembros), `posts` y `comments` (noticias), `conversations`, `conversation_members` y
`messages` (chat), `forms` y `form_responses` (datos). La función `form_stats` devuelve conteos
agregados sin exponer respuestas individuales. Detalle en
[`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

## Fases

**Fase 0 · Base (este PR).** Proyecto Expo con las cuatro pestañas (Inicio, Chat, Directorio, Datos)
navegables con datos de ejemplo, esquema de base de datos con permisos y la función del agente.

**Fase 1 · MVP piloto.**
1. Crear el proyecto en Supabase, aplicar la migración y conectar la app.
2. Registro abierto e inicio de sesión condicionado a la suscripción activa en el portal; alta de
   perfil y aprobación por Angélica.
3. Directorio real con búsqueda y filtros; botón para abrir WhatsApp del miembro.
4. Chat 1:1 y grupo general de la comunidad en tiempo real, con notificaciones push.
5. Home con noticias publicadas y comentarios.
6. Agente de noticias: borrador diario y semanal automático a partir de eventos, miembros nuevos,
   noticias del sector y temas que proponga Angélica; ella revisa y publica.
7. Formulario de alta y pantalla de estadísticas.
8. Piloto con 20 a 30 miembros vía TestFlight y prueba interna de Google Play.

**Fase 2 · Lanzamiento.** Ajustes del piloto, moderación y reportes en
chat y comentarios, fotos en el chat, publicación en App Store y Google Play.

**Fase 3 · Crecimiento.** Eventos y registro, Zona VIP, capacitaciones, analítica de uso.

## Costos de operación

Precios en dólares, sin impuestos, consultados el 15 de octubre de 2026. Pueden cambiar.

### Agente de noticias (API de Claude)

El agente usa **Claude Opus 5.5** (`claude-opus-5-5`), que cobra USD 4 por millón de tokens de
entrada y USD 20 por millón de tokens de salida. Un token equivale más o menos a tres cuartos de
una palabra en español.

| Pieza | Tokens de entrada | Tokens de salida (texto + razonamiento) | Costo por artículo |
|---|---|---|---|
| Noticia del día (~400 palabras) | ~2.000 | ~4.000 | ~USD 0,09 |
| Resumen semanal (~700 palabras) | ~3.000 | ~6.000 | ~USD 0,13 |

- **Uso previsto** (30 noticias diarias + 4 resúmenes semanales): **unos USD 3 a 5 al mes**.
- **Si el agente además busca noticias del sector en internet** antes de escribir, el contexto de
  cada artículo crece y el costo sube a **unos USD 8 a 10 al mes**.
- Son estimaciones a partir del tamaño de los textos, no mediciones. El consumo real se ve en la
  consola de Anthropic desde el primer día, y se puede fijar un tope de gasto mensual allí.
- Si algún día hace falta bajar el costo, Claude Sonnet 5.5 cuesta la mitad. Con este volumen no
  vale la pena: la diferencia es de un par de dólares al mes.

### Servicios

| Servicio | Piloto | Lanzamiento | Notas |
|---|---|---|---|
| Supabase | USD 0 | USD 25/mes (Pro) | El plan gratuito pausa el proyecto tras una semana sin actividad; para producción conviene Pro (100.000 usuarios activos, 8 GB de base de datos, 100 GB de archivos). |
| API de Claude | ~USD 5/mes | ~USD 5 a 10/mes | Ver la tabla anterior. |
| Expo EAS (compilación y envío a tiendas) | USD 0 | USD 0 a 19/mes | El plan gratuito incluye 15 compilaciones de iOS y 15 de Android al mes, suficiente para este ritmo. Starter (USD 19) da más velocidad y actualizaciones para 3.000 usuarios. |
| Notificaciones push (Expo) | USD 0 | USD 0 | Incluidas. |
| Apple Developer Program | USD 99/año | USD 99/año | Obligatorio para publicar en App Store. |
| Google Play Console | USD 25 una vez | — | Pago único. |

**Total del primer año en producción:** unos **USD 485** (Supabase Pro 300, Claude 60, Apple 99,
Google 25), o unos USD 715 si se suma EAS Starter.

## Publicación en las tiendas

### Lo que necesitan ambas tiendas

- **Cuentas a nombre de Conéctate.** Conéctate ya tiene empresa registrada, así que las cuentas
  se abren como organización y la tienda muestra "Conéctate" como vendedor. Falta el número
  **D-U-N-S** de la empresa (gratuito, se consulta o tramita en dnb.com y puede tardar una o dos
  semanas). Conviene pedirlo ya.
- **No hace falta una Mac.** EAS compila la app de iOS en la nube y la envía a App Store Connect.
- **Política de privacidad pública**, por ejemplo en conectatepro.com/privacidad, que explique qué
  datos se guardan (perfil, mensajes, respuestas de formularios) y para qué.
- **Borrar la cuenta desde la app.** Ambas tiendas lo exigen a toda app con registro. Google
  pide además un enlace web para solicitarlo.
- **Moderación del contenido de los miembros.** Como hay chat y comentarios, la app debe permitir
  reportar contenido, bloquear usuarios y retirar lo reportado. Google pide lo mismo para el
  contenido generado con IA.
- **Material de la ficha:** ícono de 1024 × 1024, capturas de pantalla, descripción corta y larga,
  categoría (Redes sociales o Negocios) y correo de soporte (conectate3g@gmail.com).
- **Suscripción pagada fuera de la app.** Como el pago se hace en el portal web, la app solo
  debe permitir iniciar sesión. No puede mostrar precios, botones de pago ni enlaces para
  suscribirse, porque entonces Apple y Google exigirían cobrar con su propio sistema de pagos y
  quedarse con una comisión. Es el modelo habitual de las apps de membresía, pero conviene
  confirmarlo con las reglas vigentes de cada tienda al preparar la ficha.
- **Notificaciones push:** una clave de Apple (APNs) y un proyecto de Firebase para Android. EAS
  las gestiona.

### Apple App Store

- Cuota de USD 99 al año.
- Cuestionario de privacidad ("etiquetas de privacidad") en App Store Connect.
- Como el acceso requiere aprobación, hay que darle a Apple una **cuenta de demostración** ya
  aprobada para que el revisor pueda entrar.
- Si en el futuro se ofrece entrar con Google o Facebook, Apple exige también "Iniciar sesión con
  Apple". Con correo o teléfono, como está planeado, no aplica.
- Pruebas con hasta 10.000 personas por TestFlight. La revisión suele tardar uno o dos días.
- Hoy la app declara soporte para iPad, lo que obliga a subir capturas de iPad. Para el MVP
  conviene desactivarlo y publicar solo para iPhone.

### Google Play

- Pago único de USD 25 y verificación de identidad.
- Formulario de **seguridad de los datos** y cuestionario de clasificación de contenido.
- **Cuentas personales nuevas:** antes de publicar, Google exige una prueba cerrada con al menos
  12 personas durante 14 días seguidos. Las cuentas de organización no tienen ese requisito, otra
  razón para abrirla a nombre de Conéctate.
- Google exige compilar para una versión reciente de Android. Expo la mantiene al día con cada
  actualización del SDK, lo que entra en el soporte mensual.

## Cotización

**Tarifa:** USD 50 por hora de lista, con un **descuento del 40 %** a cambio de una
**participación del 10 % en los ingresos por suscripciones** de la app. La tarifa efectiva es
de **USD 30 por hora**, y es la que se usa en todas las tablas.

**Desarrollo con Claude Code.** La cotización supone que el desarrollador trabaja con Claude Code
(el asistente de programación de Anthropic): Claude escribe la mayor parte del código y la
persona dirige, revisa, prueba en teléfonos reales y decide. Las horas son las de esa persona,
que es lo que se factura. El ahorro no es parejo: las capas que son sobre todo código
(pantallas, base de datos, funciones del servidor, permisos) bajan entre 60 y 80 % frente a un
desarrollo tradicional, y lo que depende de personas o de terceros baja poco o nada (pruebas en
teléfonos reales, revisiones con Angélica, reuniones, cuentas y revisión de las tiendas). La
Fase 0 de este proyecto se hizo así en una sesión de trabajo. Son estimaciones por subtarea, no
mediciones, y no incluyen los costos de servicios de la sección anterior, que se pagan
directamente a cada proveedor.

### Desarrollo del MVP

| # | Tarea | Horas | Precio (USD) |
|---|---|---|---|
| 1 | Diseño de pantallas e identidad aplicada (colores, ícono, pantalla de inicio) | 14 | 420 |
| 2 | Configuración de Supabase, entornos de prueba y producción | 4 | 120 |
| 3 | Registro, inicio de sesión, perfil y aprobación de miembros | 7,5 | 225 |
| 4 | Directorio con búsqueda, filtros, foto de perfil y botón de WhatsApp | 6 | 180 |
| 5 | Chat 1:1 y grupos en tiempo real, con leído/no leído | 14 | 420 |
| 6 | Notificaciones push | 4,5 | 135 |
| 7 | Home de noticias con comentarios | 5 | 150 |
| 8 | Agente de noticias: programación diaria/semanal, temas propuestos por Angélica y revisión antes de publicar | 8,5 | 255 |
| 9 | Formularios y pantalla de estadísticas | 6 | 180 |
| 10 | Moderación y borrado de cuenta (requisitos de las tiendas) | 5 | 150 |
| 11 | Pantallas de administración: aprobar miembros, publicar noticias, crear formularios | 4,5 | 135 |
| 12 | Pruebas en iPhone y Android y corrección de errores | 15 | 450 |
| 13 | Coordinación, reuniones y entregas | 11 | 330 |
| 14 | Acceso por suscripción: verificación con el portal de Conéctate | 9 | 270 |
| | **Subtotal desarrollo** | **114** | **3.420** |

El detalle de cada tarea está en el [anexo de horas](#anexo-detalle-de-las-horas-de-desarrollo).

### Instalación y publicación

| # | Tarea | Horas | Precio (USD) |
|---|---|---|---|
| 15 | Acompañamiento para abrir las cuentas de Apple y Google (incluido D-U-N-S) | 4 | 120 |
| 16 | Configuración de EAS, certificados, claves de notificaciones y producción en Supabase | 5 | 150 |
| 17 | Fichas de tienda: textos, capturas, política de privacidad y cuestionarios (Claude redacta los borradores) | 6 | 180 |
| 18 | Piloto en TestFlight y prueba cerrada de Google Play, envío a revisión y atención de rechazos | 8 | 240 |
| | **Subtotal instalación** | **23** | **690** |

**Total del proyecto: 137 horas, USD 4.110** (USD 6.850 a tarifa de lista, menos USD 2.740 de
descuento). Con dedicación completa son unas 3 a 4 semanas. Conviene reservar un 15 % adicional
(unos USD 620) para cambios que salgan del piloto.

### Soporte mensual

| Plan | Incluye | Horas al mes | Precio mensual (USD) |
|---|---|---|---|
| Básico | Corrección de errores, monitoreo, actualizaciones de Expo y de requisitos de las tiendas | 8 | 240 |
| Estándar | Lo anterior, más ajustes del agente de noticias y mejoras pequeñas | 16 | 480 |

Las horas que excedan el plan se facturan a la tarifa efectiva de USD 30, mientras se mantenga la
participación en las suscripciones. Las funciones nuevas de las Fases 2 y 3 se cotizan aparte.
El soporte no cambia con Claude Code: la mayor parte de esas horas se va en revisar y probar, no
en escribir código.

### Resumen de precios

El margen del 25 % se aplica solo a los costos de plataforma, que Conéctate pagaría a través del
proveedor del servicio. Las horas de trabajo van a la tarifa efectiva de USD 30, y la
suscripción a Claude se traslada a costo. A esto se suma el 10 % de los ingresos por
suscripciones, que se liquida aparte.

| Concepto | Costo base (USD) | Margen 25 % (USD) | Precio sugerido (USD) |
|---|---|---|---|
| **Pago inicial** | | | |
| Desarrollo del MVP (114 h × 30) | 3.420 | — | 3.420 |
| Instalación y publicación (23 h × 30) | 690 | — | 690 |
| Plataformas: Apple Developer, primer año (99) + Google Play (25) | 124 | 31 | 155 |
| Suscripción a Claude Max durante el desarrollo (1 mes) | 100 | — | 100 |
| **Total pago inicial** | **4.334** | **31** | **4.365** |
| **Mensualidad** | | | |
| Plataformas: Supabase Pro (25) + API de Claude (~10) | 35 | 8,75 | 43,75 |
| Horas de servicio sugeridas (plan Básico, 8 h × 30) | 240 | — | 240 |
| **Total mensual** | **275** | **8,75** | **283,75** |

- La API de Claude se calculó con el escenario alto (USD 10 al mes). Si el consumo real es menor,
  la diferencia queda a favor de Conéctate o se ajusta la mensualidad.
- La renovación de Apple (USD 99 más margen, USD 123,75) se cobra una vez al año a partir del
  segundo año. Google Play no tiene renovación.
- Con el plan Estándar (16 h) la mensualidad sería de USD 523,75.
- Expo EAS se mantiene en el plan gratuito. Si se pasa a Starter, la mensualidad sube USD 23,75
  (19 más margen).
- Claude Max cuesta desde USD 100 al mes (precio consultado el 16 de octubre de 2026 en
  claude.com). Con el plan Pro (USD 20) también se puede, pero sus límites de uso alargarían el
  trabajo.
- No incluye la reserva del 15 % para cambios que salgan del piloto.
- Para que el ahorro se cumpla, el desarrollador necesita experiencia revisando código: Claude
  Code acelera la escritura, pero alguien tiene que entender lo que se entrega y probarlo.

### Comparación con un desarrollo tradicional

Como referencia, las mismas tareas sin Claude Code, hechas por un desarrollador con experiencia
en React Native y Supabase.

| # | Tarea | Horas tradicional | Horas con Claude Code | Precio con Claude Code (USD) |
|---|---|---|---|---|
| 1 | Diseño de pantallas e identidad aplicada | 24 | 14 | 420 |
| 2 | Configuración de Supabase | 8 | 4 | 120 |
| 3 | Registro, inicio de sesión, perfil y aprobación | 24 | 7,5 | 225 |
| 4 | Directorio | 20 | 6 | 180 |
| 5 | Chat en tiempo real | 40 | 14 | 420 |
| 6 | Notificaciones push | 12 | 4,5 | 135 |
| 7 | Home de noticias y comentarios | 16 | 5 | 150 |
| 8 | Agente de noticias | 18 | 8,5 | 255 |
| 9 | Formularios y estadísticas | 20 | 6 | 180 |
| 10 | Moderación y borrado de cuenta | 16 | 5 | 150 |
| 11 | Pantallas de administración | 16 | 4,5 | 135 |
| 12 | Pruebas y corrección de errores | 24 | 15 | 450 |
| 13 | Coordinación y entregas | 16 | 11 | 330 |
| 14 | Acceso por suscripción | 16 | 9 | 270 |
| | **Subtotal desarrollo** | **270** | **114** | **3.420** |
| 15 | Acompañamiento para abrir las cuentas de Apple y Google | 4 | 4 | 120 |
| 16 | Configuración de EAS, certificados y producción | 8 | 5 | 150 |
| 17 | Fichas de tienda y política de privacidad (Claude redacta los borradores) | 10 | 6 | 180 |
| 18 | Piloto, envío a revisión y atención de rechazos | 10 | 8 | 240 |
| | **Subtotal instalación** | **32** | **23** | **690** |
| | **Total** | **302** | **137** | **4.110** |

**Pago inicial en ambos escenarios**

| Concepto | Tradicional (USD) | Con Claude Code (USD) |
|---|---|---|
| Desarrollo e instalación | 9.060 | 4.110 |
| Plataformas iniciales con margen (Apple + Google) | 155 | 155 |
| Suscripción a Claude Max durante el desarrollo (1 mes) | — | 100 |
| **Total pago inicial** | **9.215** | **4.365** |
| Mensualidad sugerida | 283,75 | 283,75 |
| Duración a tiempo completo | unas 7 semanas | unas 3 a 4 semanas |

## Decisiones tomadas

Definidas por Cristian el 15 de octubre de 2026.

- **Administración:** Angélica es la administradora. Aprueba miembros y edita y publica las
  noticias.
- **Acceso:** el registro es abierto y la app es gratuita en las tiendas, pero para entrar hace
  falta una suscripción activa, que se paga en el portal de Conéctate.
- **Identidad visual:** logo, colores y tipografía se definen en la etapa de diseño, en línea con
  el portal web. La paleta actual de la app es provisional.
- **Cuentas de tienda:** Conéctate tiene empresa registrada, pero aún no tiene cuentas en las
  tiendas. Se abrirán como organización.
- **Tarifa:** USD 50 por hora con un 40 % de descuento (USD 30 efectivos), a cambio del 10 % de
  los ingresos por suscripciones.
- **Fuentes del agente:** eventos, miembros nuevos, noticias del sector y temas que proponga
  Angélica.
- **Estimación oficial:** desarrollo con Claude Code (definido el 16 de octubre de 2026).

## Por definir

- Con qué sistema cobra hoy el portal las suscripciones. De eso depende cómo la app verifica
  que una suscripción está activa (tarea 14).
- Los términos de la participación del 10 %: desde cuándo corre, si es sobre ingresos brutos o
  netos y por cuánto tiempo.


## Anexo: detalle de las horas de desarrollo

**Cómo se calculó.** Cada tarea se dividió en subtareas pequeñas, que se pueden estimar con
confianza. La columna **Con Claude Code** es la oficial: son las horas de la persona que dirige,
revisa y prueba lo que Claude Code escribe. La columna **Sin Claude Code** queda como referencia:
son las horas de un desarrollador con experiencia en React Native y Supabase que escribe todo el
código, incluidas las pruebas y los ajustes tras la revisión. Las pantallas de la Fase 0 ya
existen con datos de ejemplo, por eso las subtareas hablan de "conectar" y no de construir desde
cero.

### 1. Diseño de pantallas e identidad aplicada · 14 h con Claude Code (24 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Bocetos de las cuatro pestañas y de los flujos de registro y chat | 6 | 3 |
| Diseño visual: colores, tipografía y componentes (botones, tarjetas, campos) | 8 | 4 |
| Ícono de la app, pantalla de carga e ícono adaptable de Android | 4 | 3 |
| Modo oscuro, tamaños de letra y contraste | 3 | 1 |
| Revisión con Conéctate y ajustes | 3 | 3 |

### 2. Configuración de Supabase · 4 h con Claude Code (8 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Crear los proyectos de prueba y de producción, y sus claves | 2 | 1 |
| Revisar y aplicar el esquema de base de datos en ambos | 2 | 1 |
| Almacenamiento de fotos y sus permisos | 2 | 1 |
| Datos de prueba y respaldos automáticos | 2 | 1 |

### 3. Registro, inicio de sesión, perfil y aprobación · 7,5 h con Claude Code (24 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Pantalla de acceso con código o enlace por correo | 6 | 2 |
| Manejo de la sesión y bloqueo de pantallas para quien no ha entrado | 4 | 1 |
| Formulario de alta de perfil con foto | 6 | 2 |
| Pantalla "tu solicitud está en revisión" | 2 | 0,5 |
| Editar perfil y elegir si aparecer en el directorio | 4 | 1 |
| Pruebas de permisos (un miembro no aprobado no ve nada) | 2 | 1 |

### 4. Directorio · 6 h con Claude Code (20 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Lista conectada a la base de datos, con carga por partes | 5 | 1,5 |
| Búsqueda y filtros por categoría y ciudad | 5 | 1,5 |
| Ficha de detalle de cada miembro | 4 | 1 |
| Botones "Escribir por WhatsApp" e "Iniciar chat" | 2 | 0,5 |
| Subida y compresión de fotos | 2 | 1 |
| Mensajes para listas vacías y errores de conexión | 2 | 0,5 |

### 5. Chat en tiempo real · 14 h con Claude Code (40 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Lista de conversaciones con último mensaje y contador de no leídos | 8 | 2 |
| Pantalla de conversación con historial que carga al desplazarse | 8 | 2 |
| Envío y recepción instantánea de mensajes | 8 | 3 |
| Crear chats 1:1 desde el directorio, y grupos con sus participantes | 6 | 2 |
| Marcas de leído y no leído | 4 | 1 |
| Funcionamiento con mala conexión: mensajes pendientes y reintentos | 4 | 2 |
| Pruebas con varios usuarios a la vez | 2 | 2 |

### 6. Notificaciones push · 4,5 h con Claude Code (12 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Pedir permiso y registrar cada teléfono | 3 | 1 |
| Función del servidor que envía las notificaciones | 4 | 1,5 |
| Avisos de mensaje nuevo y de noticia publicada | 3 | 1 |
| Abrir la pantalla correcta al tocar el aviso | 2 | 1 |

### 7. Home de noticias y comentarios · 5 h con Claude Code (16 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Lista de noticias conectada, con carga por partes | 4 | 1 |
| Pantalla del artículo con formato (títulos, listas, imágenes) | 4 | 1,5 |
| Comentarios: ver, escribir y borrar los propios, en vivo | 5 | 1,5 |
| Botón para compartir una noticia fuera de la app | 2 | 0,5 |
| Actualizar al deslizar hacia abajo y estados vacíos | 1 | 0,5 |

### 8. Agente de noticias · 8,5 h con Claude Code (18 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Ajustar las instrucciones y el tono con ejemplos reales de Conéctate | 4 | 3 |
| Darle contexto: eventos, miembros nuevos y noticias del sector | 4 | 2 |
| Espacio para que Angélica proponga temas y fuentes al agente | 2 | 0,5 |
| Programarlo a diario y cada semana | 2 | 0,5 |
| Manejo de errores y aviso al equipo si falla | 2 | 1 |
| Revisión de Angélica: leer el borrador, corregirlo y publicarlo | 4 | 1,5 |

### 9. Formularios y estadísticas · 6 h con Claude Code (20 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Formularios que se arman solos a partir de las preguntas guardadas (texto, una opción, varias) | 6 | 2 |
| Validación y envío de respuestas | 3 | 1 |
| Pantalla de estadísticas con gráficos | 7 | 2 |
| Exportar respuestas a Excel o CSV para los administradores | 4 | 1 |

### 10. Moderación y borrado de cuenta · 5 h con Claude Code (16 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Reportar un mensaje, comentario o perfil | 5 | 1,5 |
| Bloquear a un usuario (deja de ver sus mensajes y comentarios) | 4 | 1 |
| Lista de reportes para que los administradores decidan | 3 | 1 |
| Borrar la cuenta desde la app y desde una página web, con limpieza de datos | 4 | 1,5 |

### 11. Pantallas de administración · 4,5 h con Claude Code (16 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Aprobar o rechazar solicitudes de miembros | 4 | 1 |
| Asignar roles de editor y administrador | 2 | 0,5 |
| Crear, editar y publicar noticias manualmente | 6 | 2 |
| Crear, activar y cerrar formularios | 4 | 1 |

### 12. Pruebas y corrección de errores · 15 h con Claude Code (24 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Plan de pruebas con los casos principales | 3 | 1 |
| Pruebas en iPhone y Android de distintos tamaños | 8 | 8 |
| Pruebas de seguridad: que nadie vea datos que no le corresponden | 4 | 2 |
| Corrección de los errores encontrados | 9 | 4 |

### 13. Coordinación y entregas · 11 h con Claude Code (16 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Reunión de arranque y definición de detalles | 3 | 3 |
| Demostraciones semanales de avance (6 semanas) | 9 | 6 |
| Documentación y entrega final | 4 | 2 |

### 14. Acceso por suscripción · 9 h con Claude Code (16 h sin Claude Code)

| Subtarea | Sin Claude Code | Con Claude Code |
|---|---|---|
| Revisar cómo cobra hoy el portal y acordar cómo avisa a la app (aviso automático o consulta) | 3 | 3 |
| Función que recibe ese aviso y activa o vence la suscripción de cada miembro | 5 | 2 |
| Bloquear el acceso sin suscripción activa, con una pantalla que no muestre precios ni enlaces de pago | 3 | 1 |
| Pruebas de alta, renovación, vencimiento y cancelación | 3 | 2 |
| Revisión de las reglas de pagos de Apple y Google antes de enviar a revisión | 2 | 1 |
