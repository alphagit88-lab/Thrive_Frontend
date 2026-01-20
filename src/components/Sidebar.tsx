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
  MapPin,
  
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
    <div className="w-64 bg-linear-to-b from-white to-gray-50 min-h-screen flex flex-col border-r border-gray-200 shadow-lg">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="mb-3">
          <h1 className="text-4xl font-black tracking-tighter bg-linear-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent leading-none">
            Thrive
          </h1>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Dashboard</p>
      </div>

      {/* User Profile Card */}
      <div className="p-4 mx-4 mt-4">
          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center shrink-0 shadow-md ring-2 ring-white">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || 'ThriveAdmin'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <p className="text-xs text-gray-600 font-medium capitalize">{user?.role || 'admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Navigation</p>
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                      isActive
                        ? 'bg-linear-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    )}
                    <span className={`transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-gray-600 group-hover:text-green-600 group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white opacity-80"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-center">
          <p className="text-xs text-gray-500">© 2026 Thrive</p>
          <p className="text-xs text-gray-600 mt-1">Admin Dashboard</p>
        </div>
      </div>
    </div>
  );
}

