'use client';

import { useEffect, useState } from 'react';
import { customersService } from '@/services/customers.service';
import { Customer } from '@/types';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { Plus } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const savedLocationId = localStorage.getItem('locationId');
    if (savedLocationId) {
      setLocationId(savedLocationId);
      loadCustomers(savedLocationId);
    }
  }, []);

  const loadCustomers = async (locId: string) => {
    try {
      setLoading(true);
      const response = await customersService.getAll({ location_id: locId, search });
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'name', label: 'Name' },
    { key: 'contact_number', label: 'Contact Number' },
    {
      key: 'account_status',
      label: 'Account Status',
      render: (status: string) => <Badge status={status as any}>{status}</Badge>,
    },
    { key: 'created_at', label: 'Date Created', render: (date: string) => new Date(date).toLocaleDateString() },
    { key: 'total_preps', label: 'Total Preps' },
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
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Customers &gt; List</p>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            loadCustomers(locationId);
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2 inline" />
          ADD
        </Button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customers found"
        />
      </div>
    </div>
  );
}

