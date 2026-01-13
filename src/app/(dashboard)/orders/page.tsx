'use client';

import { useEffect, useState } from 'react';
import { ordersService } from '@/services/orders.service';
import { Order, OrderItem } from '@/types';
import DataTable from '@/components/DataTable';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import { Plus } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string>('');

  useEffect(() => {
    const savedLocationId = localStorage.getItem('locationId');
    if (savedLocationId) {
      setLocationId(savedLocationId);
      loadOrders(savedLocationId);
    }
  }, []);

  const loadOrders = async (locId: string) => {
    try {
      setLoading(true);
      const response = await ordersService.getAll({ location_id: locId });
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'order_number', label: 'Order ID' },
    {
      key: 'items',
      label: 'Prep Name',
      render: (items: OrderItem[]) => items?.[0]?.menu_item_name || 'N/A',
    },
    { key: 'order_date', label: 'Order Date', render: (date: string) => new Date(date).toLocaleDateString() },
    {
      key: 'status',
      label: 'Order Status',
      render: (status: string) => <Badge status={status as 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled'}>{status}</Badge>,
    },
    { key: 'total_price', label: 'Price', render: (price: number) => `LKR ${price.toLocaleString()}` },
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
        <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Orders &gt; List</p>
      </div>

      {/* Search and Add */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search orders..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <Button variant="primary">
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

