import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, TextInput } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { comments as initialComments, posts } from '@/lib/mock';
import type { Comment } from '@/lib/types';

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = posts.find((p) => p.id === id);
  const [comments, setComments] = useState<Comment[]>(initialComments.filter((c) => c.post_id === id));
  const [draft, setDraft] = useState('');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');

  if (!post) return <Text style={styles.body}>No encontramos esta noticia.</Text>;

  function addComment() {
    const body = draft.trim();
    if (!body) return;
    // TODO: insertar en la tabla comments de Supabase.
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), post_id: post!.id, author_name: 'Tú', body, created_at: new Date().toISOString() },
    ]);
    setDraft('');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: post.period === 'daily' ? 'Noticia del día' : 'Resumen semanal' }} />
      <Text style={styles.title}>{post.title}</Text>
      {post.ai_generated && <Text style={{ color: muted }}>Redactado con IA y revisado por Conéctate</Text>}
      <Text style={styles.body}>{post.body}</Text>

      <Text style={styles.section}>Comentarios ({comments.length})</Text>
      {comments.map((c) => (
        <View key={c.id} style={[styles.comment, { borderColor: border }]}>
          <Text style={styles.author}>{c.author_name}</Text>
          <Text>{c.body}</Text>
        </View>
      ))}
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="Escribe un comentario"
        placeholderTextColor={muted}
        style={[styles.input, { borderColor: border, color: text }]}
        multiline
      />
      <Button title="Comentar" onPress={addComment} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, padding: 16 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  comment: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 4 },
  author: { fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 60 },
});
