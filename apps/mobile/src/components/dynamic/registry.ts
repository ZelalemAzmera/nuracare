import React from 'react';
import RecoveryCard from './cards/RecoveryCard';
import SleepCard from './cards/SleepCard';
import HydrationCard from './cards/HydrationCard';
import NutritionCard from './cards/NutritionCard';
import ActivityCard from './cards/ActivityCard';
import AIInsightCard from './cards/AIInsightCard';
import MentalWellnessCard from './cards/MentalWellnessCard';
import QuickActionsCard from './cards/QuickActionsCard';
import { SectionType } from '../../config/remoteConfigTypes';

/**
 * Strict Component Registry
 * Maps declarative section type strings strictly to vetted, pre-compiled React Native components.
 * 
 * SECURITY INVARIANT:
 * No dynamic code injection, no eval(), no unvetted imports.
 * Unknown types evaluate to null and are skipped safely.
 */
export const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  recovery: RecoveryCard,
  sleep: SleepCard,
  hydration: HydrationCard,
  nutrition: NutritionCard,
  activity: ActivityCard,
  ai_insight: AIInsightCard,
  mental_wellness: MentalWellnessCard,
  quick_actions: QuickActionsCard
};

export function getComponentForSectionType(type: SectionType | string): React.ComponentType<any> | null {
  if (Object.prototype.hasOwnProperty.call(COMPONENT_REGISTRY, type)) {
    return COMPONENT_REGISTRY[type];
  }
  return null;
}
