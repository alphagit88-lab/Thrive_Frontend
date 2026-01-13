'use client';

import { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { customersService } from '@/services/customers.service';
import { Customer, CustomerForm } from '@/types';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import Tabs from '@/components/Tabs';
import { Plus, Pencil, Trash2, MoreVertical } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerForm & { account_status?: 'active' | 'inactive' | 'suspended' }>({
    location_id: '',
    email: '',
    name: '',
    contact_number: '',
    address: '',
    account_status: 'active',
  });
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const subTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'customers', label: 'Customers' },
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

  const loadCustomers = useCallback(async (locId: string) => {
    try {
      setLoading(true);
      const response = await customersService.getAll({ location_id: locId, search });
      if (response.success && response.data) {
        // Deduplicate customers by ID
        const customersMap = new Map<string, Customer>();
        response.data.forEach((customer) => {
          if (!customersMap.has(customer.id)) {
            customersMap.set(customer.id, customer);
          }
        });
        setCustomers(Array.from(customersMap.values()));
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (locationId) {
      loadCustomers(locationId);
      setFormData((prev) => ({ ...prev, location_id: locationId }));
    }
  }, [locationId, loadCustomers]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
      name: '',
      contact_number: '',
      address: '',
      account_status: 'active',
    });
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customersService.update(editingCustomer.id, {
          ...formData,
          location_id: locationId,
        });
      } else {
        await customersService.create({
          ...formData,
          location_id: locationId,
        });
      }
      setIsModalOpen(false);
      resetForm();
      if (locationId) {
        loadCustomers(locationId);
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      location_id: customer.location_id,
      email: customer.email,
      name: customer.name,
      contact_number: customer.contact_number || '',
      address: customer.address || '',
      account_status: customer.account_status,
    });
    setIsModalOpen(true);
    setShowActionsMenu(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      try {
        await customersService.delete(id);
        if (locationId) {
          loadCustomers(locationId);
        }
        setShowActionsMenu(null);
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('Failed to delete customer. Please try again.');
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
        return (
          <Badge status={status as 'active' | 'inactive' | 'suspended'}>
            {status}
          </Badge>
        );
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
      key: 'total_preps',
      label: 'TOTAL PREPS',
      render: (value: unknown) => (value as number) || 0,
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
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="mb-6">
        <Tabs tabs={subTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (locationId) {
              loadCustomers(locationId);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && locationId) {
              loadCustomers(locationId);
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

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customers found"
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
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
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
              {editingCustomer ? 'Update' : 'Add'}
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
              placeholder="customer@example.com"
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
              placeholder="Customer Name"
            />
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
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Customer Address"
            />
          </div>

          {editingCustomer && (
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
