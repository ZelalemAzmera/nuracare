import { Tabs } from 'expo-router';
import { Home, CalendarCheck, Pill, Heart, Users } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          color: '#0f172a',
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="checkups"
        options={{
          title: 'Daily Checkup',
          tabBarLabel: 'Checkups',
          tabBarIcon: ({ color, size }) => <CalendarCheck size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="medication"
        options={{
          title: 'Medication',
          tabBarLabel: 'Medication',
          tabBarIcon: ({ color, size }) => <Pill size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lifestyle"
        options={{
          title: 'Lifestyle',
          tabBarLabel: 'Lifestyle',
          tabBarIcon: ({ color, size }) => <Heart size={size || 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarLabel: 'Community',
          tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />,
        }}
      />
      {/* Hide wellness from tabs if accessed via legacy route */}
      <Tabs.Screen
        name="wellness"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
