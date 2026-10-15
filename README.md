# Conéctate

App para iOS y Android que conecta a los miembros de la comunidad
[Conéctate](https://conectatepro.com/). El plan de producto está en [docs/PLAN.md](docs/PLAN.md).

## Estructura

- `app/` pantallas (Expo Router): Inicio, Chat, Directorio y Datos.
- `lib/` cliente de Supabase, tipos y datos de ejemplo.
- `supabase/migrations/` esquema de base de datos con permisos (RLS).
- `supabase/functions/generate-news/` agente que redacta las noticias con IA.

## Correr la app

```bash
npm install
npx expo start
```

Abre el código QR con la app Expo Go en el celular. Sin credenciales de Supabase la app muestra
datos de ejemplo. Para conectarla, copia `.env.example` como `.env.local` y completa los valores.

## Backend

```bash
npx supabase link --project-ref <tu-proyecto>
npx supabase db push
npx supabase secrets set ANTHROPIC_API_KEY=...
npx supabase functions deploy generate-news
```

## Verificación

```bash
npm run typecheck
```
