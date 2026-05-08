'use client';

import { useEffect, useMemo, useState } from 'react';
import { franchisesService } from '@/services/franchises.service';
import { locationsService } from '@/services/locations.service';
import { Franchise, FranchiseForm, Location } from '@/types';
import KPICard from '@/components/KPICard';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Badge from '@/components/Badge';
import {
  Store,
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Users,
  Clock3,
  Wallet,
  Mail,
  Phone,
  CalendarDays,
} from 'lucide-react';

const periodOptions = ['1 - 5 years', '5 - 10 years', '10+ years'];

const createEmptyForm = (): FranchiseForm => ({
  location_id: '',
  email: '',
  password: '',
  name: '',
  phone: '',
  owner_nic: '',
  period: periodOptions[0],
  start_date: '',
  address: '',
  sop_acknowledged: false,
  operations_manual_acknowledged: false,
  packaging_manual_acknowledged: false,
  brand_guidelines_acknowledged: false,
  deposit: 0,
  royalty: 0,
  account_status: 'active',
});

export default function FranchisePage() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);
  const [formData, setFormData] = useState<FranchiseForm>(createEmptyForm());

  const loadPageData = async () => {
    try {
      setLoading(true);
      const [franchisesResponse, locationsResponse] = await Promise.all([
        franchisesService.getAll(),
        locationsService.getAll(),
      ]);

      if (franchisesResponse.success && franchisesResponse.data) {
        setFranchises(franchisesResponse.data);
      } else {
        setFranchises([]);
      }

      if (locationsResponse.success && locationsResponse.data) {
        setLocations(locationsResponse.data);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error('Failed to load franchise data:', error);
      setFranchises([]);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const resetForm = () => {
    setEditingFranchise(null);
    setFormData(createEmptyForm());
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (franchise: Franchise) => {
    setEditingFranchise(franchise);
    setFormData({
      location_id: franchise.location_id,
      email: franchise.email,
      password: '',
      name: franchise.owner_name,
      phone: franchise.phone || '',
      owner_nic: franchise.owner_nic || '',
      period: franchise.period || periodOptions[0],
      start_date: franchise.start_date || '',
      address: franchise.address || '',
      sop_acknowledged: franchise.sop_acknowledged,
      operations_manual_acknowledged: franchise.operations_manual_acknowledged,
      packaging_manual_acknowledged: franchise.packaging_manual_acknowledged,
      brand_guidelines_acknowledged: franchise.brand_guidelines_acknowledged,
      deposit: franchise.deposit,
      royalty: franchise.royalty,
      account_status: franchise.account_status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (franchiseId: string) => {
    if (!confirm('Delete this franchise account? This will remove the assigned login too.')) {
      return;
    }

    try {
      await franchisesService.delete(franchiseId);
      await loadPageData();
    } catch (error) {
      console.error('Failed to delete franchise:', error);
      alert('Failed to delete franchise. Please try again.');
    }
  };

  const handleSubmit = async (event?: React.FormEvent | React.MouseEvent) => {
    event?.preventDefault();

    try {
      if (!editingFranchise && !formData.password?.trim()) {
        alert('Password is required for new franchise accounts.');
        return;
      }

      if (editingFranchise) {
        await franchisesService.update(editingFranchise.id, {
          ...formData,
          password: formData.password?.trim() ? formData.password : undefined,
        });
      } else {
        await franchisesService.create(formData);
      }

      setIsModalOpen(false);
      resetForm();
      await loadPageData();
    } catch (error) {
      console.error('Failed to save franchise:', error);
      alert('Failed to save franchise. Please check the details and try again.');
    }
  };

  const filteredFranchises = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return franchises;
    }

    return franchises.filter((franchise) =>
      [
        franchise.location_name,
        franchise.owner_name,
        franchise.email,
        franchise.owner_nic,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [franchises, search]);

  const assignedLocationIds = useMemo(
    () =>
      new Set(
        franchises
          .filter((franchise) => franchise.id !== editingFranchise?.id)
          .map((franchise) => franchise.location_id)
      ),
    [editingFranchise?.id, franchises]
  );

  const activeFranchises = franchises.filter((franchise) => franchise.account_status === 'active').length;
  const pendingFranchises = franchises.filter((franchise) => franchise.account_status !== 'active').length;
  const totalRevenueToday = franchises.reduce((sum, franchise) => sum + (franchise.revenue_today || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-black to-black rounded-xl shadow-lg shadow-black/10">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Franchise</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              Dashboard &gt; Franchise &gt; List
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-linear-to-r from-black to-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-black/10 transition-all duration-300 transform hover:scale-105 active:scale-100 min-w-[170px] h-[48px]"
        >
          <div className="p-1 bg-white/20 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          <span>Add Franchise</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard
          title="Active Franchises"
          value={activeFranchises}
          timeframe="Currently active"
          icon={Store}
          gradient="from-blue-500 to-blue-600"
        />
        <KPICard
          title="Franchise Users"
          value={franchises.length}
          timeframe="Assigned branch logins"
          icon={Users}
          gradient="from-green-500 to-green-600"
        />
        <KPICard
          title="Pending Setup"
          value={pendingFranchises}
          timeframe="Inactive accounts"
          icon={Clock3}
          gradient="from-orange-500 to-orange-600"
        />
        <KPICard
          title="Revenue Today"
          value={`LKR ${totalRevenueToday.toLocaleString()}`}
          timeframe="Delivered orders only"
          icon={Wallet}
          gradient="from-purple-500 to-purple-600"
        />
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by location, owner, email, or NIC..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 placeholder-gray-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading franchises...</p>
          </div>
        </div>
      ) : filteredFranchises.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-semibold">No franchises found</p>
          <p className="text-sm text-gray-400 mt-1">Create the first franchise account for a location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredFranchises.map((franchise) => (
            <div
              key={franchise.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge status={franchise.account_status === 'active' ? 'active' : 'inactive'}>
                      {franchise.account_status}
                    </Badge>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Franchise
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{franchise.location_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Owner: {franchise.owner_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(franchise)}
                    className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit franchise"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(franchise.id)}
                    className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete franchise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>{franchise.location_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>{franchise.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span>{franchise.phone || 'No phone added'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarDays className="w-4 h-4 text-purple-600" />
                  <span>{franchise.start_date || 'Start date not set'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Orders Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{franchise.total_orders_today || 0}</p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Revenue Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {`LKR ${Number(franchise.revenue_today || 0).toLocaleString()}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Deposit</p>
                  <p className="font-semibold text-green-900 mt-1">
                    {`LKR ${Number(franchise.deposit || 0).toLocaleString()}`}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Royalty</p>
                  <p className="font-semibold text-amber-900 mt-1">
                    {`LKR ${Number(franchise.royalty || 0).toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingFranchise ? 'Edit Franchise' : 'Add Franchise'}
        size="xl"
        footer={
          <div className="flex items-center gap-3">
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
              {editingFranchise ? 'Update Franchise' : 'Create Franchise'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Franchise Owner Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter owner name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Franchise Owner NIC
              </label>
              <input
                type="text"
                value={formData.owner_nic || ''}
                onChange={(event) => setFormData({ ...formData, owner_nic: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter NIC number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.location_id}
                onChange={(event) => setFormData({ ...formData, location_id: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
              >
                <option value="">Select location</option>
                {locations.map((location) => {
                  const isAssigned = assignedLocationIds.has(location.id);
                  return (
                    <option key={location.id} value={location.id} disabled={isAssigned}>
                      {location.name}{isAssigned ? ' - already assigned' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Period
              </label>
              <select
                value={formData.period || periodOptions[0]}
                onChange={(event) => setFormData({ ...formData, period: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white cursor-pointer"
              >
                {periodOptions.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="owner@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password {!editingFranchise && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                required={!editingFranchise}
                value={formData.password || ''}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder={editingFranchise ? 'Leave blank to keep current password' : 'Enter password'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date || ''}
                onChange={(event) => setFormData({ ...formData, start_date: event.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(event) => setFormData({ ...formData, address: event.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.sop_acknowledged)}
                onChange={(event) => setFormData({ ...formData, sop_acknowledged: event.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">SOP</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.operations_manual_acknowledged)}
                onChange={(event) => setFormData({ ...formData, operations_manual_acknowledged: event.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Operations Manual</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.packaging_manual_acknowledged)}
                onChange={(event) => setFormData({ ...formData, packaging_manual_acknowledged: event.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Packaging Manual</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.brand_guidelines_acknowledged)}
                onChange={(event) => setFormData({ ...formData, brand_guidelines_acknowledged: event.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Brand Guidelines</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deposit
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.deposit ?? 0}
                onChange={(event) => setFormData({ ...formData, deposit: Number(event.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Royalty
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.royalty ?? 0}
                onChange={(event) => setFormData({ ...formData, royalty: Number(event.target.value) || 0 })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="0.00"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
