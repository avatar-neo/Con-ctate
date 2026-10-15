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
| **Administración** | Aprobar miembros, asignar editores, publicar noticias, crear formularios. | Desde el panel de Supabase al inicio |

Fuera del MVP, para fases siguientes: eventos con registro, Zona VIP con contenido premium,
capacitaciones en video, pagos de membresía, Revista Conecta y CA News dentro de la app.

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
2. Registro e inicio de sesión; alta de perfil y aprobación por un admin.
3. Directorio real con búsqueda y filtros; botón para abrir WhatsApp del miembro.
4. Chat 1:1 y grupo general de la comunidad en tiempo real, con notificaciones push.
5. Home con noticias publicadas y comentarios.
6. Agente de noticias: borrador diario y semanal automático; publicación por un editor.
7. Formulario de alta y pantalla de estadísticas.
8. Piloto con 20 a 30 miembros vía TestFlight y prueba interna de Google Play.

**Fase 2 · Lanzamiento.** Ajustes del piloto, identidad visual oficial, moderación y reportes en
chat y comentarios, fotos en el chat, publicación en App Store y Google Play.

**Fase 3 · Crecimiento.** Eventos y registro, Zona VIP, capacitaciones, pagos de membresía,
analítica de uso.

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

- **Cuentas a nombre de Conéctate.** Para que la tienda muestre "Conéctate" como vendedor, y no
  el nombre de una persona, las cuentas deben ser de organización. Eso exige una empresa
  registrada y un número **D-U-N-S** (gratuito, se tramita en dnb.com y puede tardar una o dos
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

Precios con una **tarifa supuesta de USD 30 por hora**, a ajustar según quién haga el trabajo.
Las horas son estimaciones para la Fase 1 (MVP) y la publicación. No incluyen los costos de
servicios de la sección anterior, que se pagan directamente a cada proveedor.

### Desarrollo del MVP

| # | Tarea | Horas | Precio (USD) |
|---|---|---|---|
| 1 | Diseño de pantallas e identidad aplicada (colores, ícono, pantalla de inicio) | 24 | 720 |
| 2 | Configuración de Supabase, entornos de prueba y producción | 8 | 240 |
| 3 | Registro, inicio de sesión, perfil y aprobación de miembros | 24 | 720 |
| 4 | Directorio con búsqueda, filtros, foto de perfil y botón de WhatsApp | 20 | 600 |
| 5 | Chat 1:1 y grupos en tiempo real, con leído/no leído | 40 | 1.200 |
| 6 | Notificaciones push | 12 | 360 |
| 7 | Home de noticias con comentarios | 16 | 480 |
| 8 | Agente de noticias: programación diaria/semanal y flujo de revisión del editor | 16 | 480 |
| 9 | Formularios y pantalla de estadísticas | 20 | 600 |
| 10 | Moderación y borrado de cuenta (requisitos de las tiendas) | 16 | 480 |
| 11 | Pantallas de administración: aprobar miembros, publicar noticias, crear formularios | 16 | 480 |
| 12 | Pruebas en iPhone y Android y corrección de errores | 24 | 720 |
| 13 | Coordinación, reuniones y entregas | 16 | 480 |
| | **Subtotal desarrollo** | **252** | **7.560** |

El detalle de cada tarea está en el [anexo de horas](#anexo-detalle-de-las-horas-de-desarrollo).

### Instalación y publicación

| # | Tarea | Horas | Precio (USD) |
|---|---|---|---|
| 14 | Acompañamiento para abrir las cuentas de Apple y Google (incluido D-U-N-S) | 4 | 120 |
| 15 | Configuración de EAS, certificados, claves de notificaciones y producción en Supabase | 8 | 240 |
| 16 | Fichas de tienda: textos, capturas, política de privacidad y cuestionarios | 10 | 300 |
| 17 | Piloto en TestFlight y prueba cerrada de Google Play, envío a revisión y atención de rechazos | 10 | 300 |
| | **Subtotal instalación** | **32** | **960** |

**Total del proyecto: 284 horas, USD 8.520.** Conviene reservar un 15 % adicional (unos USD
1.300) para cambios que salgan del piloto.

### Soporte mensual

| Plan | Incluye | Horas al mes | Precio mensual (USD) |
|---|---|---|---|
| Básico | Corrección de errores, monitoreo, actualizaciones de Expo y de requisitos de las tiendas | 8 | 240 |
| Estándar | Lo anterior, más ajustes del agente de noticias y mejoras pequeñas | 16 | 480 |

Las horas que excedan el plan se facturan a la tarifa por hora. Las funciones nuevas de las
Fases 2 y 3 se cotizan aparte.

### Resumen de precios

El margen del 25 % se aplica solo a los costos de plataforma, que Conéctate pagaría a través del
proveedor del servicio. Las horas de trabajo van a la tarifa fija de USD 30.

| Concepto | Costo base (USD) | Margen 25 % (USD) | Precio sugerido (USD) |
|---|---|---|---|
| **Pago inicial** | | | |
| Desarrollo del MVP (252 h × 30) | 7.560 | — | 7.560 |
| Instalación y publicación (32 h × 30) | 960 | — | 960 |
| Plataformas: Apple Developer, primer año (99) + Google Play (25) | 124 | 31 | 155 |
| **Total pago inicial** | **8.644** | **31** | **8.675** |
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
- No incluye la reserva del 15 % para cambios que salgan del piloto.

## Decisiones pendientes

- Quién aprueba miembros y quién edita noticias.
- Si el registro es abierto con aprobación o solo por invitación.
- Logo, colores y tipografía oficiales (hoy hay una paleta provisional).
- Si Conéctate tiene empresa registrada para abrir las cuentas de tienda como organización.
- La tarifa por hora definitiva para la cotización.
- Fuentes de información para el agente (eventos, nuevos miembros, noticias del sector).


## Anexo: detalle de las horas de desarrollo

**Cómo se calculó.** Cada tarea se dividió en subtareas de 1 a 9 horas, el tamaño que una persona
puede estimar con confianza. Las horas corresponden a un desarrollador con experiencia en React
Native y Supabase, e incluyen escribir el código, probarlo y ajustarlo tras la revisión. Las
pantallas de la Fase 0 ya existen con datos de ejemplo, por eso las subtareas hablan de
"conectar" y no de construir desde cero. Con dedicación completa (40 horas por semana) son unas
6 a 7 semanas de trabajo.

### 1. Diseño de pantallas e identidad aplicada · 24 h

| Subtarea | Horas |
|---|---|
| Bocetos de las cuatro pestañas y de los flujos de registro y chat | 6 |
| Diseño visual: colores, tipografía y componentes (botones, tarjetas, campos) | 8 |
| Ícono de la app, pantalla de carga e ícono adaptable de Android | 4 |
| Modo oscuro, tamaños de letra y contraste | 3 |
| Revisión con Conéctate y ajustes | 3 |

### 2. Configuración de Supabase · 8 h

| Subtarea | Horas |
|---|---|
| Crear los proyectos de prueba y de producción, y sus claves | 2 |
| Revisar y aplicar el esquema de base de datos en ambos | 2 |
| Almacenamiento de fotos y sus permisos | 2 |
| Datos de prueba y respaldos automáticos | 2 |

### 3. Registro, inicio de sesión, perfil y aprobación · 24 h

| Subtarea | Horas |
|---|---|
| Pantalla de acceso con código o enlace por correo | 6 |
| Manejo de la sesión y bloqueo de pantallas para quien no ha entrado | 4 |
| Formulario de alta de perfil con foto | 6 |
| Pantalla "tu solicitud está en revisión" | 2 |
| Editar perfil y elegir si aparecer en el directorio | 4 |
| Pruebas de permisos (un miembro no aprobado no ve nada) | 2 |

### 4. Directorio · 20 h

| Subtarea | Horas |
|---|---|
| Lista conectada a la base de datos, con carga por partes | 5 |
| Búsqueda y filtros por categoría y ciudad | 5 |
| Ficha de detalle de cada miembro | 4 |
| Botones "Escribir por WhatsApp" e "Iniciar chat" | 2 |
| Subida y compresión de fotos | 2 |
| Mensajes para listas vacías y errores de conexión | 2 |

### 5. Chat en tiempo real · 40 h

| Subtarea | Horas |
|---|---|
| Lista de conversaciones con último mensaje y contador de no leídos | 8 |
| Pantalla de conversación con historial que carga al desplazarse | 8 |
| Envío y recepción instantánea de mensajes | 8 |
| Crear chats 1:1 desde el directorio, y grupos con sus participantes | 6 |
| Marcas de leído y no leído | 4 |
| Funcionamiento con mala conexión: mensajes pendientes y reintentos | 4 |
| Pruebas con varios usuarios a la vez | 2 |

### 6. Notificaciones push · 12 h

| Subtarea | Horas |
|---|---|
| Pedir permiso y registrar cada teléfono | 3 |
| Función del servidor que envía las notificaciones | 4 |
| Avisos de mensaje nuevo y de noticia publicada | 3 |
| Abrir la pantalla correcta al tocar el aviso | 2 |

### 7. Home de noticias y comentarios · 16 h

| Subtarea | Horas |
|---|---|
| Lista de noticias conectada, con carga por partes | 4 |
| Pantalla del artículo con formato (títulos, listas, imágenes) | 4 |
| Comentarios: ver, escribir y borrar los propios, en vivo | 5 |
| Botón para compartir una noticia fuera de la app | 2 |
| Actualizar al deslizar hacia abajo y estados vacíos | 1 |

### 8. Agente de noticias · 16 h

| Subtarea | Horas |
|---|---|
| Ajustar las instrucciones y el tono con ejemplos reales de Conéctate | 4 |
| Darle contexto: eventos, miembros nuevos y novedades de la semana | 4 |
| Programarlo a diario y cada semana | 2 |
| Manejo de errores y aviso al equipo si falla | 2 |
| Revisión del editor: leer el borrador, corregirlo y publicarlo | 4 |

### 9. Formularios y estadísticas · 20 h

| Subtarea | Horas |
|---|---|
| Formularios que se arman solos a partir de las preguntas guardadas (texto, una opción, varias) | 6 |
| Validación y envío de respuestas | 3 |
| Pantalla de estadísticas con gráficos | 7 |
| Exportar respuestas a Excel o CSV para los administradores | 4 |

### 10. Moderación y borrado de cuenta · 16 h

| Subtarea | Horas |
|---|---|
| Reportar un mensaje, comentario o perfil | 5 |
| Bloquear a un usuario (deja de ver sus mensajes y comentarios) | 4 |
| Lista de reportes para que los administradores decidan | 3 |
| Borrar la cuenta desde la app y desde una página web, con limpieza de datos | 4 |

### 11. Pantallas de administración · 16 h

| Subtarea | Horas |
|---|---|
| Aprobar o rechazar solicitudes de miembros | 4 |
| Asignar roles de editor y administrador | 2 |
| Crear, editar y publicar noticias manualmente | 6 |
| Crear, activar y cerrar formularios | 4 |

### 12. Pruebas y corrección de errores · 24 h

| Subtarea | Horas |
|---|---|
| Plan de pruebas con los casos principales | 3 |
| Pruebas en iPhone y Android de distintos tamaños | 8 |
| Pruebas de seguridad: que nadie vea datos que no le corresponden | 4 |
| Corrección de los errores encontrados | 9 |

### 13. Coordinación y entregas · 16 h

| Subtarea | Horas |
|---|---|
| Reunión de arranque y definición de detalles | 3 |
| Demostraciones semanales de avance (6 semanas) | 9 |
| Documentación y entrega final | 4 |
