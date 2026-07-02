import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, Fonts } from '../../src/constants';
import { Card, Button } from '../../src/components/ui';
import { User as UserIcon, Settings, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <UserIcon size={48} color={Colors.surface} />
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@example.com</Text>
      </View>

      <Card variant="flat" style={styles.card}>
        <Button 
          title="Account Settings" 
          variant="ghost" 
          style={styles.menuBtn} 
        />
        <Button 
          title="Notifications" 
          variant="ghost" 
          style={styles.menuBtn} 
        />
        <Button 
          title="Privacy & Security" 
          variant="ghost" 
          style={styles.menuBtn} 
        />
        <Button 
          title="Help & Support" 
          variant="ghost" 
          style={styles.menuBtn} 
        />
      </Card>

      <Button 
        title="Log Out" 
        variant="outline" 
        style={styles.logoutBtn} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
  },
  card: {
    padding: Spacing.sm,
  },
  menuBtn: {
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: 0,
    height: 56,
  },
  logoutBtn: {
    marginTop: Spacing.xl,
    borderColor: Colors.error,
  }
});
