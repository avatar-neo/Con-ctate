import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

type IconName = SymbolViewProps['name'];

function icon(name: IconName) {
  return ({ color }: { color: ColorValue }) => <SymbolView name={name} tintColor={color} size={26} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        // Evita un error de hidratación en web.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: icon({ ios: 'newspaper', android: 'newspaper', web: 'newspaper' }) }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: 'Chat', tabBarIcon: icon({ ios: 'bubble.left.and.bubble.right', android: 'chat', web: 'chat' }) }}
      />
      <Tabs.Screen
        name="directorio"
        options={{ title: 'Directorio', tabBarIcon: icon({ ios: 'person.3', android: 'groups', web: 'groups' }) }}
      />
      <Tabs.Screen
        name="datos"
        options={{ title: 'Datos', tabBarIcon: icon({ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }) }}
      />
    </Tabs>
  );
}
