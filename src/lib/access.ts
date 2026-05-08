import { Location, User } from '@/types';

type RoleCarrier = (Pick<User, 'role'> & Partial<Pick<User, 'location_id'>>) | null | undefined;

export const isAdminUser = (user?: RoleCarrier) => user?.role === 'admin';

export const canAccessPath = (user: User | null, pathname: string) => {
  if (!user) {
    return false;
  }

  const isFranchisePage = pathname === '/franchise' || pathname.startsWith('/franchise/');
  if (isFranchisePage) {
    return isAdminUser(user);
  }

  if (user.role === 'franchise') {
    const blockedPaths = ['/users', '/locations'];
    return !blockedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  }

  return true;
};

export const filterLocationsForUser = (locations: Location[], user?: RoleCarrier) => {
  if (!user || isAdminUser(user)) {
    return locations;
  }

  return locations.filter((location) => location.id === user.location_id);
};
