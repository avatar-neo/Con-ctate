import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { conversations, ME, messages as allMessages } from '@/lib/mock';
import type { Message } from '@/lib/types';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = conversations.find((c) => c.id === id);
  const [messages, setMessages] = useState<Message[]>(allMessages.filter((m) => m.conversation_id === id));
  const [draft, setDraft] = useState('');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');

  function send() {
    const body = draft.trim();
    if (!body) return;
    // TODO: insertar en messages; Supabase Realtime lo entrega a los demás participantes.
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), conversation_id: id, sender_id: ME, body, created_at: new Date().toISOString() },
    ]);
    setDraft('');
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: conversation?.title ?? 'Chat' }} />
      <FlatList
        style={styles.flex}
        contentContainerStyle={styles.list}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => {
          const mine = item.sender_id === ME;
          return (
            <View style={[styles.bubble, mine ? [styles.mine, { backgroundColor: tint }] : { backgroundColor: card }]}>
              <Text style={mine ? styles.mineText : undefined}>{item.body}</Text>
            </View>
          );
        }}
      />
      <View style={[styles.composer, { borderColor: border }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Mensaje"
          style={[styles.input, { borderColor: border, color: text }]}
        />
        <Pressable onPress={send} style={[styles.send, { backgroundColor: tint }]}>
          <Text style={styles.mineText}>Enviar</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 12, gap: 8 },
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 14, alignSelf: 'flex-start' },
  mine: { alignSelf: 'flex-end' },
  mineText: { color: '#fff' },
  composer: { flexDirection: 'row', gap: 8, padding: 8, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  send: { borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
});
