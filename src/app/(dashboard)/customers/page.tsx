'use client';

import { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { customersService } from '@/services/customers.service';
import { Customer, CustomerForm } from '@/types';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import Tabs from '@/components/Tabs';
import { Plus, Pencil, Trash2, MoreVertical, Users, Search } from 'lucide-react';

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
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Please select a location first</p>
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customers</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              Dashboard &gt; Customers &gt; List
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-black to-black text-white font-semibold rounded-xl shadow-lg  hover:shadow-xl hover:shadow-black-500/10 hover:from-black hover:to-black transition-all duration-300 transform hover:scale-105 active:scale-100 min-w-[160px] h-[48px]"
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add Customer</span>
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
          placeholder="Search customers by name, email, or contact..."
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
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-purple-50 to-indigo-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">All Customers</h2>
            <span className="ml-2 px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              {customers.length}
            </span>
          </div>
        </div>
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
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 group"
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
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors group"
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
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
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
              className="px-6 py-2.5 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md shadow-purple-500/30"
            >
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="customer@example.com"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Customer Name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
              placeholder="Customer Address"
            />
          </div>

          {editingCustomer && (
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
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
