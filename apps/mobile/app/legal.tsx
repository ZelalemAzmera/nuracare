import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Shield, FileText, AlertTriangle, Cookie, HeartPulse, UserX, Users, Mail } from 'lucide-react-native';

export default function LegalScreen() {
  const { type } = useLocalSearchParams();
  
  const getContent = () => {
    switch(type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield size={32} color="#16a34a" />,
          sections: [
            { heading: '1. Regulatory Framework', body: 'NuraCare adheres to the Federal Democratic Republic of Ethiopia Personal Data Protection Proclamation No. 1321/2024. We process personal wellness data on the basis of explicit consent and legitimate operational necessity.' },
            { heading: '2. Health Data Protection', body: 'Your sleep, recovery, and symptom metrics are classified as Sensitive Personal Data. They are encrypted at rest using AES-256 and never shared with advertisers or third-party brokers.' },
            { heading: '3. Your Rights', body: 'Under Ethiopian law, you maintain the absolute right to access, rectify, restrict processing of, and permanently delete your health data.' }
          ]
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: <FileText size={32} color="#3b82f6" />,
          sections: [
            { heading: '1. Agreement to Terms', body: 'By creating an account or using the NuraCare mobile application, you agree to these Terms. You must be at least 18 years of age or have parental guardian supervision.' },
            { heading: '2. User Conduct', body: 'NuraCare is designed for personal wellness and community encouragement. Users may not abuse AI interfaces or attempt unauthorized reverse-engineering.' },
            { heading: '3. Limitation of Liability', body: 'NuraCare is provided on an "as is" and "as available" basis for lifestyle guidance. We disclaim all implied warranties to the fullest extent permitted by law.' }
          ]
        };
      case 'health-safety':
      case 'disclaimer':
        return {
          title: 'Health & Clinical Safety',
          icon: <AlertTriangle size={32} color="#ea580c" />,
          sections: [
            { heading: '1. Not a Substitute for Medical Care', body: 'NuraCare is an AI-powered lifestyle and wellness companion designed solely for educational, habit-tracking, and cultural wellness guidance. It is NOT certified as a medical device (Software as a Medical Device - SaMD) under EFDA regulations.' },
            { heading: '2. Emergency Situations', body: 'If you believe you are experiencing a medical emergency (e.g. chest pain, breathing difficulties, stroke symptoms), immediately call emergency services (907 in Ethiopia) or proceed to the nearest medical emergency facility.' },
            { heading: '3. Cultural Remedies & Fasting', body: 'Herbal advice (telba, shiro, moringa) and Ethiopian Orthodox/Islamic fasting guidance are nutritional recommendations and should not replace clinical medical advice from your physician.' }
          ]
        };
      case 'ai-disclaimer':
        return {
          title: 'AI Companion Safety',
          icon: <HeartPulse size={32} color="#16a34a" />,
          sections: [
            { heading: '1. AI Transparency', body: 'Nura AI utilizes advanced large language models to converse in English, Amharic, and Afaan Oromo. AI outputs are probabilistic and may occasionally contain inaccuracies.' },
            { heading: '2. Grounded Health Context', body: 'Nura AI references your consented recovery score and fasting mode. It is explicitly constrained from fabricating clinical diagnoses or prescribing medications.' }
          ]
        };
      case 'cookies':
        return {
          title: 'Cookie & Local Storage',
          icon: <Cookie size={32} color="#f59e0b" />,
          sections: [
            { heading: '1. Local Storage on Mobile', body: 'NuraCare mobile uses encrypted MMKV local storage on your device to store cached remote configurations and offline recovery check-ins.' },
            { heading: '2. Web Cookies', body: 'Our web platform uses essential cookies for authentication sessions and optional analytics cookies subject to your explicit opt-in preferences.' }
          ]
        };
      case 'data-deletion':
        return {
          title: 'Data Deletion Rights',
          icon: <UserX size={32} color="#dc2626" />,
          sections: [
            { heading: '1. Right to Erasure', body: 'You can erase your account directly within the app at Settings → Privacy & Security → Delete Account.' },
            { heading: '2. Web Deletion Portal', body: 'Non-app users or individuals who have uninstalled the app may submit an external deletion request at nuracare.pro.et/data-deletion.' }
          ]
        };
      case 'community-guidelines':
        return {
          title: 'Community Guidelines',
          icon: <Users size={32} color="#8b5cf6" />,
          sections: [
            { heading: '1. Mutual Respect', body: 'NuraCare community members treat all participants with kindness, respect, and encouragement.' },
            { heading: '2. Authentic Wellness Sharing', body: 'Do not share dangerous unverified medical claims or promote illegal substances.' }
          ]
        };
      case 'contact':
      default:
        return {
          title: 'Contact & Support',
          icon: <Mail size={32} color="#0f172a" />,
          sections: [
            { heading: '1. Support Inquiries', body: 'Email: support@nuracare.pro.et\nAddis Ababa, Ethiopia' },
            { heading: '2. Data Protection Officer', body: 'For privacy inquiries or compliance matters regarding Proclamation 1321/2024: privacy@nuracare.pro.et' }
          ]
        };
    }
  };

  const info = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>{info.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}>
          {info.icon}
        </View>

        {info.sections.map((sec, idx) => (
          <View key={idx} style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>{sec.heading}</Text>
            <Text style={styles.sectionBody}>{sec.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingBottom: 40 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionBlock: { backgroundColor: '#ffffff', padding: 18, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  sectionHeading: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  sectionBody: { fontSize: 14, color: '#475569', lineHeight: 22 }
});
