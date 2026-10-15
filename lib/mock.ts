// Datos de ejemplo para ver la app sin backend. Se reemplazan por consultas a Supabase.
import type { Comment, Conversation, FormQuestion, Member, Message, Post } from './types';

export const ME = 'me';

export const members: Member[] = [
  { id: 'm1', full_name: 'Angélica Cujar', business_name: 'Conéctate', category: 'Comunidad', city: 'Sur de Florida', bio: 'Fundadora y directora de Conéctate.', whatsapp: null, avatar_url: null },
  { id: 'm2', full_name: 'María Gómez', business_name: 'Dulce Hogar Bakery', category: 'Alimentos', city: 'Orlando', bio: 'Repostería artesanal para eventos.', whatsapp: null, avatar_url: null },
  { id: 'm3', full_name: 'Carlos Rojas', business_name: 'Rojas Seguros', category: 'Seguros', city: 'New York', bio: 'Seguros de salud y vida para familias latinas.', whatsapp: null, avatar_url: null },
  { id: 'm4', full_name: 'Lucía Pérez', business_name: 'LP Marketing', category: 'Marketing', city: 'Colombia', bio: 'Redes sociales y marca personal.', whatsapp: null, avatar_url: null },
];

export const posts: Post[] = [
  {
    id: 'p1',
    title: 'Cinco ideas para vender más en temporada navideña',
    summary: 'Estrategias sencillas para preparar tu negocio antes de diciembre.',
    body: 'Contenido de ejemplo. En producción este texto lo redacta el agente de noticias y lo revisa el equipo de Conéctate antes de publicarse.',
    period: 'daily',
    published_at: '2026-10-15T12:00:00Z',
    ai_generated: true,
  },
  {
    id: 'p2',
    title: 'Resumen de la semana en la comunidad',
    summary: 'Nuevos miembros, próximos eventos y oportunidades de alianza.',
    body: 'Contenido de ejemplo del resumen semanal.',
    period: 'weekly',
    published_at: '2026-10-12T12:00:00Z',
    ai_generated: true,
  },
];

export const comments: Comment[] = [
  { id: 'c1', post_id: 'p1', author_name: 'María Gómez', body: '¡Muy útil! Voy a probar la idea de los combos.', created_at: '2026-10-15T14:00:00Z' },
];

export const conversations: Conversation[] = [
  { id: 'g1', title: 'Comunidad Conéctate', last_message: 'Bienvenidas las nuevas integrantes', updated_at: '2026-10-15T13:00:00Z', is_group: true },
  { id: 'd1', title: 'María Gómez', last_message: '¿Hablamos el jueves?', updated_at: '2026-10-14T18:30:00Z', is_group: false },
];

export const messages: Message[] = [
  { id: 'x1', conversation_id: 'd1', sender_id: 'm2', body: 'Hola, vi tu perfil en el directorio.', created_at: '2026-10-14T18:00:00Z' },
  { id: 'x2', conversation_id: 'd1', sender_id: ME, body: '¡Hola María! Encantada.', created_at: '2026-10-14T18:10:00Z' },
  { id: 'x3', conversation_id: 'd1', sender_id: 'm2', body: '¿Hablamos el jueves?', created_at: '2026-10-14T18:30:00Z' },
];

export const intakeForm: FormQuestion[] = [
  { id: 'q1', label: '¿En qué ciudad está tu negocio?', kind: 'single_choice', options: ['Sur de Florida', 'Orlando', 'New York', 'Colombia', 'Otra'] },
  { id: 'q2', label: '¿Cuántos años tiene tu negocio?', kind: 'single_choice', options: ['Menos de 1', '1 a 3', '3 a 5', 'Más de 5'] },
  { id: 'q3', label: '¿Qué capacitación te interesa más?', kind: 'single_choice', options: ['Marketing', 'Ventas', 'Redes sociales', 'Finanzas', 'Administración'] },
  { id: 'q4', label: '¿Qué te gustaría encontrar en la comunidad?', kind: 'text' },
];

export const stats = [
  { label: 'Miembros activos', value: '500+' },
  { label: 'Años de trayectoria', value: '8+' },
  { label: 'Ciudades', value: '5' },
];
