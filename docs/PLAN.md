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

## Decisiones pendientes

- Quién aprueba miembros y quién edita noticias.
- Si el registro es abierto con aprobación o solo por invitación.
- Logo, colores y tipografía oficiales (hoy hay una paleta provisional).
- Cuentas de Apple Developer (USD 99 al año) y Google Play (USD 25 una vez) a nombre de Conéctate.
- Fuentes de información para el agente (eventos, nuevos miembros, noticias del sector).
