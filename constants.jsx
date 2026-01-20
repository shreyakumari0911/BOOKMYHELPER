import { Hammer, Droplets, Zap, ShieldCheck, Home } from 'lucide-react';

export const SERVICE_TYPES = [
  { id: 'cleaning', label: 'Pro Cleaning', icon: <Home className="w-6 h-6" />, color: 'bg-pink-400' },
  { id: 'plumbing', label: 'Leak Fixer', icon: <Droplets className="w-6 h-6" />, color: 'bg-blue-400' },
  { id: 'electrical', label: 'Volt Masters', icon: <Zap className="w-6 h-6" />, color: 'bg-yellow-400' },
  { id: 'carpentry', label: 'Wood Works', icon: <Hammer className="w-6 h-6" />, color: 'bg-orange-400' },
  { id: 'security', label: 'Safe Guard', icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-green-400' },
];

export const STATUS_COLORS = {
  PENDING: 'bg-yellow-300',
  ASSIGNED: 'bg-blue-300',
  IN_PROGRESS: 'bg-purple-300',
  COMPLETED: 'bg-green-400',
  CANCELLED: 'bg-red-400',
  REJECTED: 'bg-orange-300',
};
