'use client';

import { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { ordersService } from '@/services/orders.service';
import { Order, OrderItem } from '@/types';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import Tabs from '@/components/Tabs';
import { Plus } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('list');
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

  useEffect(() => {
    if (locationId) {
      loadOrders(locationId);
    }
  }, [locationId, loadOrders]);

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
        <Button variant="primary" onClick={() => {
          // TODO: Implement add order functionality
          console.log('Add order clicked');
        }}>
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
    </div>
  );
}
