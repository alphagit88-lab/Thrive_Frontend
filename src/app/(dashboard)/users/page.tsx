'use client';

import { useEffect, useState, useCallback } from 'react';
import { usersService } from '@/services/users.service';
import { User } from '@/types';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { Plus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string>('');
  const [search, setSearch] = useState('');

  const loadUsers = useCallback(async (locId: string) => {
    try {
      setLoading(true);
      const response = await usersService.getAll({ location_id: locId, search });
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const savedLocationId = localStorage.getItem('locationId');
    if (savedLocationId) {
      setLocationId(savedLocationId);
      loadUsers(savedLocationId);
    }
  }, [loadUsers]);

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'name', label: 'Name' },
    { key: 'contact_number', label: 'Contact Number' },
    {
      key: 'account_status',
      label: 'Account Status',
      render: (status: string) => <Badge status={status as 'active' | 'inactive' | 'suspended'}>{status}</Badge>,
    },
    { key: 'created_at', label: 'Date Created', render: (date: string) => new Date(date).toLocaleDateString() },
    {
      key: 'role',
      label: 'Role',
      render: (role: string) => <Badge status={role === 'admin' ? 'active' : 'inactive'}>{role}</Badge>,
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Users &gt; List</p>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            loadUsers(locationId);
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Button variant="primary">
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
        />
      </div>
    </div>
  );
}

