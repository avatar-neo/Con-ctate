// Agente de noticias: redacta un borrador diario o semanal para el Home.
// Se ejecuta con un cron de Supabase (ver docs/PLAN.md). Los artículos quedan como
// borrador (status = 'draft') hasta que un editor de Conéctate los publique.
//
// Secretos necesarios: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SYSTEM = `Eres el editor de noticias de Conéctate, una red de apoyo mutuo para emprendedores latinos
(muchos migrantes) en el Sur de Florida, Orlando, New York y Colombia. Escribes en español neutro,
cercano y práctico. Cada artículo debe dejar al lector con una idea accionable para su negocio
(marketing, ventas, redes sociales, finanzas, administración, alianzas o equilibrio de vida).
No inventes cifras, nombres de personas ni eventos: si mencionas datos de la comunidad, usa solo
los que vienen en el mensaje del usuario.`;

const ARTICLE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    body: { type: 'string' },
  },
  required: ['title', 'summary', 'body'],
  additionalProperties: false,
};

Deno.serve(async (req) => {
  const { period = 'daily', context = '' } = await req.json().catch(() => ({}));
  if (period !== 'daily' && period !== 'weekly') {
    return new Response('period debe ser daily o weekly', { status: 400 });
  }

  const anthropic = new Anthropic(); // lee ANTHROPIC_API_KEY
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const today = new Date().toISOString().slice(0, 10);
  const ask =
    period === 'daily'
      ? `Escribe la noticia del día (${today}) de unas 400 palabras.`
      : `Escribe el resumen semanal (semana del ${today}) de unas 700 palabras.`;

  const response = await anthropic.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: ARTICLE_SCHEMA } },
    system: SYSTEM,
    messages: [{ role: 'user', content: `${ask}\n\nNovedades de la comunidad para usar como contexto:\n${context || '(ninguna)'}` }],
  });

  if (response.stop_reason === 'refusal') {
    return new Response('El modelo no generó el artículo', { status: 502 });
  }
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') return new Response('Respuesta vacía', { status: 502 });

  const article = JSON.parse(text.text) as { title: string; summary: string; body: string };
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...article, period, status: 'draft', ai_generated: true })
    .select('id')
    .single();
  if (error) return new Response(error.message, { status: 500 });

  return Response.json({ id: data.id });
});
