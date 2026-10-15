import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View, useThemeColor } from '@/components/Themed';
import { conversations } from '@/lib/mock';

export default function ChatListScreen() {
  const muted = useThemeColor({}, 'muted');
  const border = useThemeColor({}, 'border');

  return (
    <FlatList
      data={conversations}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => (
        <Link href={{ pathname: '/chat/[id]', params: { id: item.id } }} asChild>
          <Pressable>
            <View style={[styles.row, { borderColor: border }]}>
              <Text style={styles.title}>
                {item.is_group ? '👥 ' : ''}
                {item.title}
              </Text>
              <Text style={{ color: muted }} numberOfLines={1}>
                {item.last_message}
              </Text>
            </View>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 2 },
  title: { fontSize: 16, fontWeight: '600' },
});
