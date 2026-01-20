'use client';

import { useEffect, useState } from 'react';
import KPICard from '@/components/KPICard';
import DataTable from '@/components/DataTable';
import { ordersService } from '@/services/orders.service';
import { Order, OrderStats } from '@/types';
import Badge from '@/components/Badge';
import { BarChart3, TrendingUp, Package, DollarSign, Clock } from 'lucide-react';

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
      render: (_value: unknown, row: Order) => {
        const items = row.items || [];
        return items?.[0]?.menu_item_name || 'N/A';
      }
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
        <div className="text-center">
          <div className="p-4 bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Please select a location from the header to view dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-black to-black rounded-xl shadow-lg shadow-black/10">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <span>Dashboard</span>
              <span>&gt;</span>
              <span className="text-black font-medium">Analytics</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Preps Received"
          value={stats?.preps_received || 0}
          change={{ value: '+21 Today', isPositive: true }}
          timeframe="Last 30 days"
          chart="line"
          chartData={[10, 15, 12, 18, 21, 20, 22]}
          icon={Package}
          gradient="from-blue-500 to-blue-600"
        />
        <KPICard
          title="Preps Delivered"
          value={stats?.preps_delivered || 0}
          change={{ value: '+11 Today', isPositive: true }}
          timeframe="Last 30 days"
          chart="line"
          chartData={[5, 8, 7, 10, 9, 11, 10]}
          icon={TrendingUp}
          gradient="from-green-500 to-green-600"
        />
        <KPICard
          title="Total Earnings"
          value={`LKR ${stats?.total_earnings?.toLocaleString() || 0}`}
          change={{ value: `LKR ${stats?.total_earnings || 0} Today`, isPositive: true }}
          timeframe="Last 30 days"
          chart="bar"
          chartData={[1200, 1500, 1800, 2000, 2200, 2500, 2800]}
          icon={DollarSign}
          gradient="from-black to-black"
        />
      </div>

      {/* Recent Preps Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Recent Preps</h2>
          </div>
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

