'use client';

import { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { usersService } from '@/services/users.service';
import { locationsService } from '@/services/locations.service';
import { User, UserForm, Location } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import Tabs from '@/components/Tabs';
import { Plus, Pencil, Trash2, MoreVertical, Users, Search, MapPin } from 'lucide-react';

export default function UsersPage() {
  const { user: loggedInUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserForm & { account_status?: 'active' | 'inactive' | 'suspended'; password?: string }>({
    location_id: '',
    email: '',
    password: '',
    name: '',
    contact_number: '',
    role: 'staff',
    account_status: 'active',
  });
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const subTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'list', label: 'List' },
    { id: 'add', label: 'Add' },
  ];

  useEffect(() => {
    if (!hasInitialized.current && loggedInUser) {
      hasInitialized.current = true;
      // Use logged-in user's location - users can only access their own location
      const userLocationId = loggedInUser.location_id;
      if (userLocationId) {
        startTransition(() => {
          setLocationId(userLocationId);
          // Also update localStorage to keep it in sync
          localStorage.setItem('locationId', userLocationId);
        });
      }
    }
  }, [loggedInUser]);

  // Load all locations for display purposes
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await locationsService.getAll();
        if (response.success && response.data) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error('Failed to load locations:', error);
      }
    };
    loadLocations();
  }, []);

  const loadUsers = useCallback(async (locId: string) => {
    try {
      setLoading(true);
      const response = await usersService.getAll({ location_id: locId, search });
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    // Use logged-in user's location - users can only access their own location
    const userLocationId = loggedInUser?.location_id || locationId;
    if (userLocationId) {
      loadUsers(userLocationId);
      setFormData((prev) => ({ ...prev, location_id: userLocationId }));
      // Update locationId state to keep it in sync
      if (userLocationId !== locationId) {
        setLocationId(userLocationId);
      }
    }
  }, [loggedInUser?.location_id, locationId, loadUsers]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActionsMenu) {
        setShowActionsMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActionsMenu]);

  const resetForm = () => {
    // Always use the logged-in user's location
    const userLocationId = loggedInUser?.location_id || locationId || '';
    setFormData({
      location_id: userLocationId,
      email: '',
      password: '',
      name: '',
      contact_number: '',
      role: 'staff',
      account_status: 'active',
    });
    setEditingUser(null);
  };

  const getLocationName = (locId: string) => {
    const location = locations.find(loc => loc.id === locId);
    return location?.name || 'Unknown Location';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure we're using the logged-in user's location
      const userLocationId = loggedInUser?.location_id || locationId;
      if (!userLocationId) {
        alert('Location not found. Please refresh the page.');
        return;
      }

      if (editingUser) {
        // For update, only send password if it's provided
        const updateData: Partial<UserForm> & { account_status?: string; password?: string } = {
          email: formData.email,
          name: formData.name,
          contact_number: formData.contact_number,
          role: formData.role,
          account_status: formData.account_status,
        };
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }
        await usersService.update(editingUser.id, updateData);
      } else {
        // For create, password is required
        if (!formData.password || formData.password.trim() === '') {
          alert('Password is required for new users');
          return;
        }
        // Use logged-in user's location - users can only create users for their own location
        await usersService.create({
          ...formData,
          location_id: userLocationId,
        });
      }
      setIsModalOpen(false);
      resetForm();
      if (userLocationId) {
        loadUsers(userLocationId);
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      location_id: user.location_id,
      email: user.email,
      password: '', // Don't pre-fill password
      name: user.name,
      contact_number: user.contact_number || '',
      role: user.role,
      account_status: user.account_status,
    });
    setIsModalOpen(true);
    setShowActionsMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await usersService.delete(id);
        if (locationId) {
          loadUsers(locationId);
        }
        setShowActionsMenu(null);
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const columns = [
    { key: 'email', label: 'EMAIL' },
    { key: 'name', label: 'NAME' },
    {
      key: 'location_id',
      label: 'LOCATION',
      render: (value: unknown, row: User) => {
        const locId = value as string;
        const locationName = row.location_name || getLocationName(locId);
        return (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">{locationName}</span>
          </div>
        );
      },
    },
    {
      key: 'contact_number',
      label: 'CONTACT NUMBER',
      render: (value: unknown) => (value as string) || 'N/A',
    },
    {
      key: 'account_status',
      label: 'ACCOUNT STATUS',
      render: (value: unknown) => {
        const status = value as string;
        return <Badge status={status as 'active' | 'inactive' | 'suspended'}>{status}</Badge>;
      },
    },
    {
      key: 'role',
      label: 'ROLE',
      render: (value: unknown) => {
        const role = value as string;
        return <Badge status={role === 'admin' ? 'active' : 'inactive'}>{role}</Badge>;
      },
    },
    {
      key: 'created_at',
      label: 'DATE CREATED',
      render: (value: unknown) => {
        const date = value as string;
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ];

  if (!locationId || !loggedInUser?.location_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Loading user location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-black to-black rounded-xl shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Users</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              Dashboard &gt; Users &gt; List
              {locationId && (
                <>
                  <span>&gt;</span>
                  <span className="text-gray-700 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {getLocationName(locationId)}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-black to-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-black/10 hover:from-black hover:to-black transition-all duration-300 transform hover:scale-105 active:scale-100 min-w-[160px] h-[48px]"
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add User</span>
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div>
        <Tabs tabs={subTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Modern Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (locationId) {
              loadUsers(locationId);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && locationId) {
              loadUsers(locationId);
            }
          }}
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
            <span className="ml-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              {users.length}
            </span>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No users found"
          actions={(row) => (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(showActionsMenu === row.id ? null : row.id);
                }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                title="Actions"
              >
                <MoreVertical className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
              {showActionsMenu === row.id && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(row);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 transition-colors group"
                    >
                      <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Edit / Update
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingUser ? 'Edit User' : 'Add User'}
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-6 py-2.5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/30"
            >
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {editingUser 
                  ? (editingUser.location_name || getLocationName(editingUser.location_id))
                  : (getLocationName(loggedInUser?.location_id || locationId))
                }
              </span>
              <span className="ml-auto text-xs text-gray-500 italic">
                {editingUser ? '(Cannot be changed)' : '(Your location)'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              Users can only be added to your assigned location
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="User Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password {!editingUser && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
            />
            {editingUser && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                Leave blank to keep current password
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'admin' | 'manager' | 'staff' | 'kitchen_staff',
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="kitchen_staff">Kitchen Staff</option>
              </select>
            </div>
          </div>

          {editingUser && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Status
              </label>
              <select
                value={formData.account_status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_status: e.target.value as 'active' | 'inactive' | 'suspended',
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}

