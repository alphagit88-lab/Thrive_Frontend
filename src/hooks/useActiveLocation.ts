'use client';

import { useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminUser } from '@/lib/access';

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = () => callback();

  window.addEventListener('storage', handler);
  window.addEventListener('locationChanged', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('locationChanged', handler);
  };
};

const getSnapshot = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem('locationId') || '';
};

export function useActiveLocation() {
  const { user } = useAuth();
  const storedLocationId = useSyncExternalStore(subscribe, getSnapshot, () => '');

  const locationId = !user
    ? ''
    : isAdminUser(user)
      ? storedLocationId || user.location_id || ''
      : user.location_id || '';

  return {
    locationId,
    isLockedToAssignedLocation: Boolean(user) && !isAdminUser(user),
  };
}
