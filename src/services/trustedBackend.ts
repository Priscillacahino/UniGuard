import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { EmergencyAlert } from '../types';
import { runtimeConfig } from './runtimeConfig';

export const trustedBackendEnabled = runtimeConfig.trustedBackendEnabled;

export async function createAlertViaTrustedBackend(alert: EmergencyAlert): Promise<void> {
  if (!trustedBackendEnabled) throw new Error('TRUSTED_BACKEND_DISABLED');
  const fn = httpsCallable(getFunctions(getApp()), 'createEmergencyAlert');
  await fn({
    id: alert.id,
    category: alert.category,
    userName: alert.userProfile?.name,
    role: alert.userProfile?.role,
    location: alert.location ? { lat: alert.location.lat, lng: alert.location.lng } : null,
    locationName: alert.locationName,
    isInsideCampus: alert.isInsideCampus,
    source: 'web',
  });
}