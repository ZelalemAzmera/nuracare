import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Check, Star, X, ShieldCheck } from 'lucide-react-native';

const CHAPA_URL = 'https://checkout.chapa.co/checkout/payment/1234567890';
const STRIPE_URL = 'https://buy.stripe.com/test_1234567890';

export default function SubscriptionModal() {
  const handleSubscribe = async (provider: 'chapa' | 'stripe') => {
    const url = provider === 'chapa' ? CHAPA_URL : STRIPE_URL;
    await WebBrowser.openBrowserAsync(url);
    // Real app would verify success via deep link or server polling
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Star size={48} color="#f59e0b" fill="#f59e0b" />
        <Text style={styles.heroTitle}>Upgrade to Premium</Text>
        <Text style={styles.heroSubtitle}>Unlock the full potential of your AI Health Companion</Text>
      </View>

      <View style={styles.features}>
        {[
          'Unlimited AI Medical Consultations',
          'Priority Doctor Appointments',
          'Advanced Biometric Analytics',
          'Custom Lifestyle & Diet Coaching',
          'Family Health Sharing'
        ].map((feat, idx) => (
          <View key={idx} style={styles.featRow}>
            <Check size={20} color="#16a34a" />
            <Text style={styles.featText}>{feat}</Text>
          </View>
        ))}
      </View>

      <View style={styles.planCard}>
        <Text style={styles.planName}>Nura Premium</Text>
        <Text style={styles.planPrice}>$9.99<Text style={styles.planPeriod}> / month</Text></Text>
        <Text style={styles.planDesc}>Everything you need to take control of your health.</Text>
      </View>

      <Text style={styles.paymentTitle}>Choose Payment Method</Text>

      <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#16a34a' }]} onPress={() => handleSubscribe('stripe')}>
        <ShieldCheck size={20} color="#ffffff" />
        <Text style={styles.payBtnText}>Pay with Card (Stripe)</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#0ea5e9' }]} onPress={() => handleSubscribe('chapa')}>
        <ShieldCheck size={20} color="#ffffff" />
        <Text style={styles.payBtnText}>Pay with Telebirr / Local (Chapa)</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        By subscribing, you agree to our Terms of Service. You can cancel anytime.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 20 },
  header: { alignItems: 'flex-end', paddingTop: 40 },
  closeBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  hero: { alignItems: 'center', marginVertical: 32 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginTop: 16, marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', paddingHorizontal: 20 },
  features: { marginBottom: 32 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  featText: { fontSize: 16, color: '#334155', fontWeight: '500' },
  planCard: { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#4ade80', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 32 },
  planName: { fontSize: 20, fontWeight: 'bold', color: '#16a34a', marginBottom: 8 },
  planPrice: { fontSize: 36, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  planPeriod: { fontSize: 16, color: '#64748b', fontWeight: '500' },
  planDesc: { fontSize: 14, color: '#475569', textAlign: 'center' },
  paymentTitle: { fontSize: 16, fontWeight: '600', color: '#64748b', marginBottom: 16, textAlign: 'center' },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 12, marginBottom: 12 },
  payBtnText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  disclaimer: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 16, marginBottom: 40 }
});
