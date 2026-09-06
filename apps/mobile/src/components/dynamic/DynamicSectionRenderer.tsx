import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SDUISection } from '../../config/remoteConfigTypes';
import { getComponentForSectionType } from './registry';

interface DynamicSectionRendererProps {
  sections: SDUISection[];
  biometrics?: {
    recoveryScore?: number;
    steps?: number;
    hydrationLiters?: number;
    sleepDuration?: string;
  };
}

/**
 * DynamicSectionRenderer
 * Interprets validated remote SDUI section definitions, checks safety invariants,
 * looks up verified React components from the registry, and renders them in order.
 */
export default function DynamicSectionRenderer({ sections, biometrics }: DynamicSectionRendererProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {sections.map((section) => {
        const Component = getComponentForSectionType(section.type);

        // Security / Robustness: Skip unknown component types safely
        if (!Component) {
          if (__DEV__) {
            console.warn(`[SDUI] Unregistered component type "${section.type}" skipped safely.`);
          }
          return null;
        }

        // Map section properties and live biometrics into component props
        const componentProps: Record<string, any> = {
          key: section.id,
          title: section.title,
          subtitle: section.subtitle,
          badge: section.badge,
          payload: section.payload,
          ...section.payload
        };

        // Inject verified biometrics if applicable
        if (section.type === 'recovery' && biometrics?.recoveryScore !== undefined) {
          componentProps.score = biometrics.recoveryScore;
        } else if (section.type === 'activity' && biometrics?.steps !== undefined) {
          componentProps.steps = biometrics.steps;
        } else if (section.type === 'hydration' && biometrics?.hydrationLiters !== undefined) {
          componentProps.currentLiters = biometrics.hydrationLiters;
        } else if (section.type === 'sleep' && biometrics?.sleepDuration !== undefined) {
          componentProps.duration = biometrics.sleepDuration;
        }

        try {
          return <Component {...componentProps} />;
        } catch (err) {
          console.error(`[SDUI] Error rendering section ${section.id}:`, err);
          return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%'
  }
});
