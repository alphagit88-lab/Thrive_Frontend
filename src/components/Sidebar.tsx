'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  UtensilsCrossed, 
  Pizza, 
  ClipboardList, 
  Users, 
  User, 
  Settings, 
  MapPin
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/dashboard' },
  { id: 'ingredients', label: 'Ingredients', icon: <UtensilsCrossed className="w-5 h-5" />, path: '/ingredients' },
  { id: 'menu', label: 'Menu', icon: <Pizza className="w-5 h-5" />, path: '/menu' },
  { id: 'orders', label: 'Orders', icon: <ClipboardList className="w-5 h-5" />, path: '/orders' },
  { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" />, path: '/customers' },
  { id: 'users', label: 'Users', icon: <User className="w-5 h-5" />, path: '/users' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  { id: 'locations', label: 'Locations', icon: <MapPin className="w-5 h-5" />, path: '/locations' },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-50 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-green-600">Thrive</h1>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b bg-gray-100 rounded-lg mx-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || 'ThriveAdmin'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'admin'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Dashboard</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={isActive ? 'text-green-700' : 'text-gray-700'}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

