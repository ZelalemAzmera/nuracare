import { Tabs } from 'expo-router';
import { Home, MessageCircle, Activity } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#16a34a',
      headerShown: true,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Nura Chat',
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: 'Wellness',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="checkups"
        options={{
          title: 'Checkups',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />, // Placeholder icon
        }}
      />
      <Tabs.Screen
        name="discovery"
        options={{
          title: 'Discovery',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />, // Placeholder icon
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />, // Placeholder icon
        }}
      />
    </Tabs>
  );
}
