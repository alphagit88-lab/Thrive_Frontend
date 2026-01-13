interface BadgeProps {
  status: 'active' | 'inactive' | 'draft' | 'received' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'suspended';
  children: React.ReactNode;
}

export default function Badge({ status, children }: BadgeProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    draft: 'bg-yellow-100 text-yellow-800',
    received: 'bg-orange-100 text-orange-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
    >
      {children}
    </span>
  );
}

