'use client';

import { useEffect, useState } from 'react';
import { Search, Bell, User, ChevronDown, LogOut, MapPin } from 'lucide-react';
import { Location } from '@/types';
import { locationsService } from '@/services/locations.service';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  showSearch?: boolean;
}

export default function Header({
  showSearch = true,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await locationsService.getAll();
        if (response.success && response.data) {
          setLocations(response.data);
          
          // Get saved location or default to first location
          const savedLocationId = localStorage.getItem('locationId');
          if (savedLocationId && response.data.find((loc) => loc.id === savedLocationId)) {
            // Use saved location if it still exists
            setLocationId(savedLocationId);
          } else if (response.data.length > 0) {
            // Auto-select first location as default
            const firstLocation = response.data[0];
            setLocationId(firstLocation.id);
            localStorage.setItem('locationId', firstLocation.id);
          }
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      }
    };

    loadLocations();
  }, []);

  const handleLocationChange = (id: string) => {
    setLocationId(id);
    localStorage.setItem('locationId', id);
    // Reload page to update all location-dependent data
    window.location.reload();
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search */}
          {showSearch && (
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:bg-white hover:border-gray-300 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Right: Location, Notifications, User */}
          <div className="flex items-center gap-3">
            {/* Location Selector */}
            {locations.length > 0 && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-green-600" />
                </div>
                <select
                  value={locationId || ''}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 border-2 border-green-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 font-semibold cursor-pointer min-w-[200px] shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-600"
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600 pointer-events-none" />
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-1 right-1 w-5 h-5 bg-linear-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                2
              </span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group border-2 border-transparent hover:border-gray-200"
              >
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white group-hover:ring-green-200 transition-all">
                  {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {user?.role || 'admin'}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Section */}
                    <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white">
                          {user?.name?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-600 truncate">{user?.email || 'user@thrive.com'}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <p className="text-xs text-gray-600 font-medium capitalize">{user?.role || 'admin'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                      >
                        <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

