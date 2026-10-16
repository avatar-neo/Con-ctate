import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { posts } from '@/lib/mock';

export default function HomeScreen() {
  const card = useThemeColor({}, 'card');
  const muted = useThemeColor({}, 'muted');

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={posts}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => (
        <Link href={{ pathname: '/post/[id]', params: { id: item.id } }} asChild>
          <Pressable>
            <View style={[styles.card, { backgroundColor: card }]}>
              <Text style={[styles.badge, { color: muted }]}>
                {item.period === 'daily' ? 'Noticia del día' : 'Resumen semanal'}
              </Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={{ color: muted }}>{item.summary}</Text>
            </View>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, gap: 6 },
  badge: { fontSize: 12, textTransform: 'uppercase' },
  title: { fontSize: 18, fontWeight: '600' },
});
