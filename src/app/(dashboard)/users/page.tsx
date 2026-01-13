'use client';

import { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { usersService } from '@/services/users.service';
import { User, UserForm } from '@/types';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import Tabs from '@/components/Tabs';
import { Plus, Pencil, Trash2, MoreVertical } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
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
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const savedLocationId = localStorage.getItem('locationId');
      if (savedLocationId) {
        startTransition(() => {
          setLocationId(savedLocationId);
        });
      }
    }
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
    if (locationId) {
      loadUsers(locationId);
      setFormData((prev) => ({ ...prev, location_id: locationId }));
    }
  }, [locationId, loadUsers]);

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
    setFormData({
      location_id: locationId || '',
      email: '',
      password: '',
      name: '',
      contact_number: '',
      role: 'staff',
      account_status: 'active',
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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
        await usersService.create({
          ...formData,
          location_id: locationId,
        });
      }
      setIsModalOpen(false);
      resetForm();
      if (locationId) {
        loadUsers(locationId);
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
    {
      key: 'role',
      label: 'ROLE',
      render: (value: unknown) => {
        const role = value as string;
        return <Badge status={role === 'admin' ? 'active' : 'inactive'}>{role}</Badge>;
      },
    },
  ];

  if (!locationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a location first</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="mb-6">
        <Tabs tabs={subTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
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
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2 inline" />
          ADD
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
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
                className="p-1 text-gray-600 hover:text-gray-900"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showActionsMenu === row.id && (
                <div
                  className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(row);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit / Update
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingUser ? 'Update' : 'Add'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="User Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!editingUser && '*'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
            />
            {editingUser && (
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="kitchen_staff">Kitchen Staff</option>
            </select>
          </div>

          {editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

