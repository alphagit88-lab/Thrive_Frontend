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
import { Plus, X, ShoppingCart, Search, Receipt } from 'lucide-react';

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
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
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
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Orders</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              Dashboard &gt; Orders &gt; List
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-black to-black text-white font-semibold rounded-xl shadow-lg  hover:shadow-xl hover:shadow-black/10 hover:from-black hover:to-black transition-all duration-300 transform hover:scale-105 active:scale-100 min-w-[160px] h-[48px]"
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add Order</span>
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
          placeholder="Search orders by order number, customer, or menu item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-linear-to-r from-orange-50 to-amber-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-800">All Orders</h2>
            <span className="ml-2 px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {orders.length}
            </span>
          </div>
        </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Total:</span>
              <span className="text-lg font-bold text-orange-600">
                LKR {calculateTotal().toLocaleString()}
              </span>
            </div>
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
                className="px-6 py-2.5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/30"
              >
                Create Order
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
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
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Menu Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
            {formData.items.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No items added</p>
                <p className="text-xs text-gray-400 mt-1">Click &quot;Add Item&quot; to add menu items to this order</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item, index) => {
                  const selectedMenuItem = menuItems.find((mi) => mi.id === item.menu_item_id);
                  return (
                    <div
                      key={index}
                      className="p-5 border-2 border-gray-200 rounded-xl bg-linear-to-br from-white to-gray-50 hover:border-orange-300 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900">Item {index + 1}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Menu Item <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={item.menu_item_id}
                            onChange={(e) => handleItemChange(index, 'menu_item_id', e.target.value)}
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 cursor-pointer text-sm"
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
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
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
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                            disabled={!!selectedMenuItem}
                          />
                          {selectedMenuItem && (
                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                              Auto-filled from menu item
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Subtotal (LKR)
                          </label>
                          <input
                            type="text"
                            value={`LKR ${(item.unit_price * item.quantity).toLocaleString()}`}
                            disabled
                            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-orange-50 text-sm font-semibold text-orange-700"
                          />
                        </div>
                      </div>
                      {selectedMenuItem && selectedMenuItem.description && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-gray-600">{selectedMenuItem.description}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
              placeholder="Additional notes for this order..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
