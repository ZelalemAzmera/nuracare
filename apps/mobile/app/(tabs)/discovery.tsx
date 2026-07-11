import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { getTailoredFeed } from '@nuracare/shared';
import { getProfile } from '../../src/storage/profileStorage';
import * as WebBrowser from 'expo-web-browser';
import { PlayCircle, BookOpen, Leaf, Heart } from 'lucide-react-native';

export default function DiscoveryScreen() {
  const [feed, setFeed] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const profile = getProfile() || {};
    const items = getTailoredFeed(profile);
    setFeed(items);
  }, []);

  const handleOpenLink = async (url: string) => {
    if (url) await WebBrowser.openBrowserAsync(url);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'herb': return <Leaf size={16} color="#16a34a" />;
      case 'food': return <Heart size={16} color="#e11d48" />;
      default: return <BookOpen size={16} color="#0284c7" />;
    }
  };

  const getFilteredFeed = () => {
    if (filter === 'All') return feed;
    if (filter === 'Videos') return feed.filter(i => i.youtubeLink);
    if (filter === 'Herbs') return feed.filter(i => i.type === 'herb');
    if (filter === 'Foods') return feed.filter(i => i.type === 'food');
    return feed;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discovery</Text>
        <Text style={styles.subtitle}>Curated health knowledge for you</Text>
      </View>

      <View style={styles.filterScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {['All', 'Videos', 'Herbs', 'Foods'].map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]} 
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
        {getFilteredFeed().map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.card} 
            onPress={() => handleOpenLink(item.youtubeLink || 'https://google.com/search?q=' + encodeURIComponent(item.name))}
          >
            <View style={styles.cardHeader}>
              <View style={styles.tagWrap}>
                {getIcon(item.type)}
                <Text style={styles.tagText}>{item.type.toUpperCase()}</Text>
              </View>
              {item.youtubeLink && <PlayCircle size={20} color="#ef4444" />}
            </View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            
            {item.benefits && (
              <View style={styles.benefitsBox}>
                {item.benefits.slice(0, 2).map((b: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}

            {item.description && !item.benefits && (
              <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>
            )}
            
            {item.relevance && (
              <Text style={styles.relevanceText}>✨ {item.relevance}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  filterScroll: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  filterContainer: { padding: 16, gap: 10, paddingRight: 32 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f1f5f9' },
  filterBtnActive: { backgroundColor: '#16a34a' },
  filterText: { color: '#475569', fontWeight: '500' },
  filterTextActive: { color: '#ffffff', fontWeight: '600' },
  feed: { flex: 1 },
  feedContent: { padding: 16, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tagWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  cardDesc: { fontSize: 15, color: '#475569', lineHeight: 22 },
  benefitsBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, gap: 6 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16a34a', marginTop: 8 },
  benefitText: { fontSize: 14, color: '#334155', flex: 1, lineHeight: 20 },
  relevanceText: { marginTop: 12, fontSize: 13, color: '#0284c7', fontWeight: '600', fontStyle: 'italic' }
});
