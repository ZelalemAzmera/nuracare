import React from 'react';
import { useRemoteConfigStore } from '../../store/remoteConfigStore';

interface FeatureFlagProps {
  name: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Declarative FeatureFlag wrapper.
 * Evaluates whether a feature is remotely enabled before rendering children.
 */
export default function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useRemoteConfigStore((state) => state.isFeatureEnabled(name));

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
