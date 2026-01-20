import React from 'react';
import { STATUS_COLORS } from '../constants';
import { Clock, MapPin, User, Activity } from 'lucide-react';
import BrutalButton from './BrutalButton';

const BookingCard = ({ booking, onUpdateStatus, currentUser, showAdminActions }) => {
  const isProvider = currentUser && currentUser !== 'Customer' && currentUser !== 'Admin';
  const isAdmin = currentUser === 'Admin';
  const isCustomer = currentUser === 'Customer';

  const getNextActions = (status) => {
    switch (status) {
      case 'PENDING':
        return isProvider ? [{ label: 'Accept', status: 'ASSIGNED', variant: 'primary' }] : [];
      case 'ASSIGNED':
        return isProvider
          ? [
              { label: 'Start Work', status: 'IN_PROGRESS', variant: 'success' },
              { label: 'Reject', status: 'REJECTED', variant: 'danger' },
            ]
          : [];
      case 'IN_PROGRESS':
        return isProvider ? [{ label: 'Complete', status: 'COMPLETED', variant: 'success' }] : [];
      default:
        return [];
    }
  };

  return (
    <div
      className={`border-4 border-black p-6 neobrutal-shadow bg-white relative overflow-hidden flex flex-col gap-4 group hover:rotate-1 transition-transform`}
    >
      <div
        className={`absolute top-0 right-0 border-b-4 border-l-4 border-black px-4 py-1 font-black ${STATUS_COLORS[booking.status]}`}
      >
        {booking.status}
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{booking.serviceType}</h3>
        <p className="text-lg font-bold text-gray-600 mb-4">Request #{booking.id.slice(0, 8)}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 font-medium">
          <User className="w-5 h-5" />
          <span>Customer: {booking.customerName}</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <MapPin className="w-5 h-5" />
          <span>{booking.address}</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <Clock className="w-5 h-5" />
          <span>Placed: {new Date(booking.createdAt).toLocaleTimeString()}</span>
        </div>
        {booking.providerName && (
          <div className="flex items-center gap-2 font-medium text-blue-700">
            <Activity className="w-5 h-5" />
            <span>Assigned to: {booking.providerName}</span>
          </div>
        )}
        {['PENDING', 'REJECTED'].includes(booking.status) && (
          <div className="flex items-center gap-2 font-medium text-orange-600">
            <Clock className="w-5 h-5" />
            <span>Auto-retry: {booking.retryCount || 0}/3</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-4 mt-auto">
        {onUpdateStatus &&
          getNextActions(booking.status).map((action) => (
            <BrutalButton
              key={action.label}
              size="sm"
              variant={action.variant}
              onClick={() => onUpdateStatus(booking.id, action.status, currentUser)}
            >
              {action.label}
            </BrutalButton>
          ))}

        {isCustomer && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
          <BrutalButton size="sm" variant="danger" onClick={() => onUpdateStatus?.(booking.id, 'CANCELLED', currentUser)}>
            Cancel Booking
          </BrutalButton>
        )}

        {showAdminActions && isAdmin && (
          <div className="w-full mt-4 pt-4 border-t-2 border-black border-dashed">
            <p className="text-xs font-black uppercase mb-2">Admin Overrides</p>
            <div className="flex flex-wrap gap-2">
              <BrutalButton size="sm" variant="secondary" onClick={() => onUpdateStatus?.(booking.id, 'PENDING', 'Admin')}>
                Reset to Pending
              </BrutalButton>
              <BrutalButton size="sm" variant="secondary" onClick={() => onUpdateStatus?.(booking.id, 'COMPLETED', 'Admin')}>
                Force Complete
              </BrutalButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
