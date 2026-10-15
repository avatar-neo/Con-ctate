import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { members } from '@/lib/mock';

export default function DirectoryScreen() {
  const [query, setQuery] = useState('');
  const card = useThemeColor({}, 'card');
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.full_name, m.business_name, m.category, m.city].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={filtered}
      keyExtractor={(m) => m.id}
      ListHeaderComponent={
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre, negocio, categoría o ciudad"
          placeholderTextColor={muted}
          style={[styles.search, { borderColor: border, color: text }]}
        />
      }
      renderItem={({ item }) => (
        <View style={[styles.card, { backgroundColor: card }]}>
          <Text style={styles.name}>{item.full_name}</Text>
          {item.business_name && <Text>{item.business_name}</Text>}
          <Text style={{ color: muted }}>{[item.category, item.city].filter(Boolean).join(' · ')}</Text>
          {item.bio && <Text style={{ color: muted }}>{item.bio}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  search: { borderWidth: 1, borderRadius: 10, padding: 12 },
  card: { borderRadius: 12, padding: 16, gap: 4 },
  name: { fontSize: 17, fontWeight: '600' },
});
