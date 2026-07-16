import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Shield, FileText, AlertTriangle } from 'lucide-react-native';

export default function LegalScreen() {
  const { type } = useLocalSearchParams();
  
  const getContent = () => {
    switch(type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield size={32} color="#16a34a" />,
          content: 'Last Updated: Nov 15, 2024\n\nNuraCare ("we", "our", or "us") is committed to protecting your privacy. We collect personal health data solely for the purpose of providing personalized health insights via our AI models.\n\nYour data is securely stored and never sold to third parties. You have the right to request deletion of your records at any time.'
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText size={32} color="#3b82f6" />,
          content: 'Last Updated: Nov 15, 2024\n\nBy using NuraCare, you agree to our Terms of Service. You must be at least 18 years old to use the platform. Our services are provided "as is" without any warranties.'
        };
      case 'disclaimer':
      default:
        return {
          title: 'Medical Disclaimer',
          icon: <AlertTriangle size={32} color="#ea580c" />,
          content: 'NuraCare is an AI-powered health companion designed for informational and educational purposes only.\n\nIT IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT.\n\nAlways seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.'
        };
    }
  };

  const info = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.title}>{info.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.iconWrap}>
          {info.icon}
        </View>
        <Text style={styles.bodyText}>{info.content}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, borderBottomWidth: 1, borderColor: '#e2e8f0' },
  backBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  content: { flex: 1 },
  contentInner: { padding: 24, alignItems: 'center' },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  bodyText: { fontSize: 16, color: '#334155', lineHeight: 24, textAlign: 'center' }
});
