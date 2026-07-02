import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Fonts } from '../../src/constants';
import { Card, Badge, Button } from '../../src/components/ui';
import { useCheckups, Checkup } from '../../src/hooks/useCheckups';
import { Calendar } from 'lucide-react-native';

export default function CheckupsScreen() {
  const { checkups, loading, refresh } = useCheckups();

  const renderItem = ({ item }: { item: Checkup }) => (
    <Card variant="elevated">
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <Badge 
          label={item.completed ? 'Completed' : 'Upcoming'} 
          variant={item.completed ? 'success' : 'info'} 
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.textMuted} />
          <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <Text style={styles.doctorText}>{item.doctor}</Text>
      </View>
      <Button 
        title="View Details" 
        variant="outline" 
        style={styles.detailsBtn} 
        onPress={() => {}} 
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={checkups}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No checkups found. Schedule one to get started.</Text>
          }
          refreshing={loading}
          onRefresh={refresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardBody: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  doctorText: {
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    fontWeight: '500',
  },
  detailsBtn: {
    height: 36,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    marginTop: Spacing.xl,
    fontSize: Fonts.sizes.md,
  }
});
