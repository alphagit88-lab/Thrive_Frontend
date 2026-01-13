'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Location, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
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
  { id: 'dashboard', label: 'Analytics', icon: '📊', path: '/dashboard' },
  { id: 'ingredients', label: 'Ingredients', icon: '🍴', path: '/ingredients' },
  { id: 'menu', label: 'Menu', icon: '🍕', path: '/menu' },
  { id: 'orders', label: 'Orders', icon: '📋', path: '/orders' },
  { id: 'customers', label: 'Customers', icon: '👥', path: '/customers' },
  { id: 'users', label: 'Users', icon: '👤', path: '/users' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  { id: 'locations', label: 'Locations', icon: '📍', path: '/locations' },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-50 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-green-600">THRIVE</h1>
      </div>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-b bg-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}

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
                  <span className="text-lg">{item.icon}</span>
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

