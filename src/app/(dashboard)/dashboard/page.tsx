'use client';

import { useEffect, useState } from 'react';
import KPICard from '@/components/KPICard';
import DataTable from '@/components/DataTable';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStats } from '@/types';
import Badge from '@/components/Badge';

export default function DashboardPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationId, setLocationId] = useState<string>('');

  useEffect(() => {
    // Get location from localStorage or use first available
    const savedLocationId = localStorage.getItem('locationId');
    if (savedLocationId) {
      setLocationId(savedLocationId);
      loadData(savedLocationId);
    }
  }, []);

  const loadData = async (locId: string) => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        ordersService.getStats({ location_id: locId }),
        ordersService.getAll({ location_id: locId }),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (ordersRes.success && ordersRes.data) {
        // Get first 10 orders for recent preps
        setRecentOrders(ordersRes.data.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const orderColumns = [
    { key: 'order_number', label: 'Order ID' },
    { 
      key: 'items', 
      label: 'Prep Name', 
      render: (items: Array<{ menu_item_name?: string }>) => items?.[0]?.menu_item_name || 'N/A' 
    },
    { key: 'customer_name', label: 'Customer Name' },
        {
          key: 'status',
          label: 'Status',
          render: (value: unknown) => {
            const status = value as string;
            return <Badge status={status as 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'active' | 'inactive' | 'draft' | 'suspended'}>{status}</Badge>;
          },
        },
  ];

  if (!locationId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select a location from the header to view dashboard data.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Dashboard &gt; Analytics</p>
        </div>
        
        {/* Profile Section */}
        <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">NutriMojo</p>
            <p className="text-xs text-gray-500">admin</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <KPICard
          title="Preps Received"
          value={stats?.preps_received || 0}
          change={{ value: '+21 Today', isPositive: true }}
          timeframe="Last 30 days"
          chart="line"
          chartData={[10, 15, 12, 18, 21, 20, 22]}
        />
        <KPICard
          title="Preps Delivered"
          value={stats?.preps_delivered || 0}
          change={{ value: '+11 Today', isPositive: true }}
          timeframe="Last 30 days"
          chart="line"
          chartData={[5, 8, 7, 10, 9, 11, 10]}
        />
        <KPICard
          title="Total Earnings"
          value={`LKR ${stats?.total_earnings?.toLocaleString() || 0}`}
          change={{ value: `LKR ${stats?.total_earnings || 0} Today`, isPositive: true }}
          timeframe="Last 30 days"
          chart="bar"
          chartData={[1200, 1500, 1800, 2000, 2200, 2500, 2800]}
        />
      </div>

      {/* Recent Preps Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Preps</h2>
        </div>
        <div className="p-6">
          <DataTable
            columns={orderColumns}
            data={recentOrders}
            loading={loading}
            emptyMessage="No recent orders"
          />
        </div>
      </div>
    </div>
  );
}

