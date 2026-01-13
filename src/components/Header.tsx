'use client';

import { useEffect, useState } from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { Location } from '@/types';
import { locationsService } from '@/services/locations.service';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export default function Header({
  title,
  showSearch = true,
}: HeaderProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<string>('');

  useEffect(() => {
    loadLocations();
  }, []);

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

  const handleLocationChange = (id: string) => {
    setLocationId(id);
    localStorage.setItem('locationId', id);
    // Reload page to update all location-dependent data
    window.location.reload();
  };

  const selectedLocation = locations.find((loc) => loc.id === locationId);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Search */}
        {showSearch && (
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )}

        {/* Right: Location, Notifications, User */}
        <div className="flex items-center gap-4">
          {/* Location Selector */}
          {locations.length > 0 && (
            <div className="relative">
              <select
                value={locationId || ''}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border-2 border-green-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 font-medium cursor-pointer min-w-[180px]"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          {/* User Avatar */}
          <button className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}

