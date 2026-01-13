'use client';

import { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { ordersService } from '@/services/orders.service';
import { menuService } from '@/services/menu.service';
import { customersService } from '@/services/customers.service';
import { Order, OrderItem, OrderForm, MenuItem, Customer } from '@/types';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import Tabs from '@/components/Tabs';
import { Plus, X } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState<OrderForm>({
    location_id: '',
    customer_id: '',
    notes: '',
    items: [],
  });
  const hasInitialized = useRef(false);

  const subTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
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

  const loadOrders = useCallback(async (locId: string) => {
    try {
      setLoading(true);
      const response = await ordersService.getAll({ location_id: locId });
      if (response.success && response.data) {
        // Deduplicate orders by ID
        const ordersMap = new Map<string, Order>();
        response.data.forEach((order) => {
          if (!ordersMap.has(order.id)) {
            ordersMap.set(order.id, order);
          }
        });
        // Filter by search if provided
        let filteredOrders = Array.from(ordersMap.values());
        if (search.trim()) {
          const searchLower = search.toLowerCase();
          filteredOrders = filteredOrders.filter((order) => {
            return (
              order.order_number?.toLowerCase().includes(searchLower) ||
              order.customer_name?.toLowerCase().includes(searchLower) ||
              order.items?.some((item) => item.menu_item_name?.toLowerCase().includes(searchLower))
            );
          });
        }
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const loadMenuItems = useCallback(async (locId: string) => {
    try {
      const response = await menuService.getAll({ location_id: locId, status: 'active' });
      if (response.success && response.data) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  }, []);

  const loadCustomers = useCallback(async (locId: string) => {
    try {
      const response = await customersService.getAll({ location_id: locId });
      if (response.success && response.data) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  }, []);

  useEffect(() => {
    if (locationId) {
      loadOrders(locationId);
      setFormData((prev) => ({ ...prev, location_id: locationId }));
      loadMenuItems(locationId);
      loadCustomers(locationId);
    }
  }, [locationId, loadOrders, loadMenuItems, loadCustomers]);

  const resetForm = () => {
    setFormData({
      location_id: locationId || '',
      customer_id: '',
      notes: '',
      items: [],
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          menu_item_id: '',
          quantity: 1,
          unit_price: 0,
          notes: '',
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    if (field === 'menu_item_id') {
      const menuItem = menuItems.find((mi) => mi.id === value);
      newItems[index] = {
        ...newItems[index],
        menu_item_id: value as string,
        unit_price: menuItem?.price || 0,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate at least one item
      if (formData.items.length === 0) {
        alert('Please add at least one menu item to the order');
        return;
      }

      // Validate all items have menu_item_id
      const invalidItems = formData.items.filter((item) => !item.menu_item_id || item.quantity <= 0);
      if (invalidItems.length > 0) {
        alert('Please select a menu item and set quantity for all items');
        return;
      }

      // Prepare order data
      const orderData: OrderForm = {
        location_id: locationId,
        customer_id: formData.customer_id || undefined,
        notes: formData.notes || undefined,
        items: formData.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          notes: item.notes || undefined,
        })),
      };

      await ordersService.create(orderData);
      setIsModalOpen(false);
      resetForm();
      if (locationId) {
        loadOrders(locationId);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.unit_price || 0) * (item.quantity || 0);
    }, 0);
  };

  const formatIngredients = (items: OrderItem[]): string => {
    if (!items || items.length === 0) return 'N/A';
    // Get unique menu item names from all order items
    const menuItemNames = new Set<string>();
    items.forEach((item) => {
      if (item.menu_item_name) {
        menuItemNames.add(item.menu_item_name);
      }
    });
    return Array.from(menuItemNames).join(', ') || 'N/A';
  };

  const columns = [
    { key: 'order_number', label: 'ORDER ID' },
    {
      key: 'prep_name',
      label: 'PREP NAME',
      render: (_value: unknown, row: Order) => row.items?.[0]?.menu_item_name || 'N/A',
    },
    {
      key: 'order_date',
      label: 'ORDER DATE',
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
      key: 'ingredients',
      label: 'INGREDIENTS',
      render: (_value: unknown, row: Order) => formatIngredients(row.items || []),
    },
    {
      key: 'status',
      label: 'ORDER STATUS',
      render: (value: unknown) => {
        const status = value as string;
        return (
          <Badge status={status as 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled'}>
            {status}
          </Badge>
        );
      },
    },
    {
      key: 'total_price',
      label: 'PRICE',
      render: (value: unknown) => {
        const price = value as number;
        return `LKR ${(price || 0).toLocaleString()}`;
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Orders</p>
      </div>

      {/* Sub-navigation Tabs */}
      <Tabs tabs={subTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Search and Add */}
      <div className="flex items-center gap-4 my-6">
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyMessage="No orders found"
        />
      </div>

      {/* Add Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Add Order"
        size="lg"
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
              Create Order
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer (Optional)
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a customer (optional)</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Menu Items *
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="text-sm"
              >
                <Plus className="w-4 h-4 mr-1 inline" />
                Add Item
              </Button>
            </div>
            {formData.items.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-300 rounded-lg">
                No items added. Click &quot;Add Item&quot; to add menu items to this order.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item, index) => {
                  const selectedMenuItem = menuItems.find((mi) => mi.id === item.menu_item_id);
                  return (
                    <div
                      key={index}
                      className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Menu Item *
                          </label>
                          <select
                            required
                            value={item.menu_item_id}
                            onChange={(e) => handleItemChange(index, 'menu_item_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          >
                            <option value="">Select menu item</option>
                            {menuItems.map((menuItem) => (
                              <option key={menuItem.id} value={menuItem.id}>
                                {menuItem.name} - LKR {menuItem.price.toLocaleString()}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Unit Price (LKR)
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            disabled={!!selectedMenuItem}
                          />
                          {selectedMenuItem && (
                            <p className="text-xs text-gray-500 mt-1">
                              Auto-filled from menu item
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Subtotal (LKR)
                          </label>
                          <input
                            type="text"
                            value={(item.unit_price * item.quantity).toLocaleString()}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-medium"
                          />
                        </div>
                      </div>
                      {selectedMenuItem && (
                        <p className="text-xs text-gray-500 mt-2">
                          {selectedMenuItem.description || 'No description'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total */}
          {formData.items.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-green-600">
                  LKR {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Additional notes for this order..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
