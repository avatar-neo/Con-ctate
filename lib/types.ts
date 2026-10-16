// Tipos que reflejan las tablas de supabase/migrations/0001_init.sql.

export type Member = {
  id: string;
  full_name: string;
  business_name: string | null;
  category: string | null;
  city: string | null;
  bio: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
};

export type Post = {
  id: string;
  title: string;
  summary: string;
  body: string;
  period: 'daily' | 'weekly';
  published_at: string;
  ai_generated: boolean;
};

export type Comment = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
  is_group: boolean;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type FormQuestion = {
  id: string;
  label: string;
  kind: 'text' | 'single_choice';
  options?: string[];
};
