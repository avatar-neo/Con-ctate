import { useState } from 'react';
import { Button, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { intakeForm, stats } from '@/lib/mock';

export default function DataScreen() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const card = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');

  function submit() {
    // TODO: insertar en form_responses de Supabase.
    setSent(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.section}>La comunidad en cifras</Text>
      <View style={styles.stats}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.stat, { backgroundColor: card }]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Encuesta para miembros</Text>
      {sent ? (
        <Text>¡Gracias! Recibimos tus respuestas.</Text>
      ) : (
        <>
          {intakeForm.map((q) => (
            <View key={q.id} style={styles.question}>
              <Text style={styles.label}>{q.label}</Text>
              {q.kind === 'single_choice' ? (
                <View style={styles.options}>
                  {q.options?.map((opt) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        style={[styles.chip, { borderColor: selected ? tint : border, backgroundColor: selected ? tint : 'transparent' }]}>
                        <Text style={selected ? styles.chipSelected : undefined}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  value={answers[q.id] ?? ''}
                  onChangeText={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                  style={[styles.input, { borderColor: border, color: text }]}
                  multiline
                />
              )}
            </View>
          ))}
          <Button title="Enviar respuestas" onPress={submit} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  section: { fontSize: 18, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, textAlign: 'center' },
  question: { gap: 8 },
  label: { fontWeight: '600' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipSelected: { color: '#fff' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, minHeight: 60 },
});
