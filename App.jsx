import React, { useState, useEffect, useCallback } from 'react';
import { SERVICE_TYPES } from './constants';
import BrutalButton from './components/BrutalButton';
import BookingCard from './components/BookingCard';
import {
  Plus,
  LayoutDashboard,
  UserCircle,
  Settings,
  X,
  Trash2,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

const MOCK_PROVIDERS = [
  { id: 'p1', name: 'Mario Rossi', specialty: 'Plumbing', isAvailable: true },
  { id: 'p2', name: 'Sasha Volt', specialty: 'Electrical', isAvailable: true },
  { id: 'p3', name: 'Clean Team 5', specialty: 'Cleaning', isAvailable: true },
];

const loadPersistedState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('bmh_state') || '{}');
    return {
      bookings: Array.isArray(saved.bookings) ? saved.bookings : [],
      globalHistory: Array.isArray(saved.globalHistory) ? saved.globalHistory : [],
    };
  } catch {
    return { bookings: [], globalHistory: [] };
  }
};

const App = ({ initialViewMode = 'CUSTOMER', lockViewMode = false }) => {
  const persisted = loadPersistedState();
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [bookings, setBookings] = useState(persisted.bookings);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [globalHistory, setGlobalHistory] = useState(persisted.globalHistory);
  const [activeProvider, setActiveProvider] = useState(MOCK_PROVIDERS[0]);

  const getSpecialtyForService = (serviceType = '') => {
    const s = serviceType.toLowerCase();
    if (s.includes('clean')) return 'Cleaning';
    if (s.includes('leak') || s.includes('plumb')) return 'Plumbing';
    if (s.includes('volt') || s.includes('electric')) return 'Electrical';
    if (s.includes('wood')) return 'Carpentry';
    if (s.includes('safe') || s.includes('guard') || s.includes('security')) return 'Security';
    return serviceType;
  };

  const autoAssignProvider = useCallback((bookingId) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;

        if (!['PENDING', 'REJECTED'].includes(b.status)) return b;

        if ((b.retryCount || 0) >= 3) return b;

        const desiredSpecialty = getSpecialtyForService(b.serviceType);
        const specialtyMatch = MOCK_PROVIDERS.find(
          (p) => p.isAvailable && p.specialty.toLowerCase() === desiredSpecialty.toLowerCase()
        );

        const availableProvider =
          specialtyMatch || MOCK_PROVIDERS.find((p) => p.isAvailable) || MOCK_PROVIDERS[0];

        const event = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          fromStatus: b.status,
          toStatus: 'ASSIGNED',
          user: 'System',
          notes: `Auto-assigned to ${availableProvider.name} (Attempt ${(b.retryCount || 0) + 1})`,
        };

        setGlobalHistory((gh) => [event, ...gh]);

        return {
          ...b,
          status: 'ASSIGNED',
          providerId: availableProvider.id,
          providerName: availableProvider.name,
          retryCount: (b.retryCount || 0) + 1,
          lastRetryAt: Date.now(),
          history: [...b.history, event],
        };
      })
    );
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      bookings.forEach((b) => {
        if (['PENDING', 'REJECTED'].includes(b.status) && (b.retryCount || 0) < 3) {
          autoAssignProvider(b.id);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [bookings, autoAssignProvider]);

  // Persist state when it changes
  useEffect(() => {
    const payload = { bookings, globalHistory };
    try {
      localStorage.setItem('bmh_state', JSON.stringify(payload));
    } catch {}
  }, [bookings, globalHistory]);

  const addBooking = (customerName, serviceType, address) => {
    const newBooking = {
      id: Math.random().toString(36).substr(2, 9),
      customerName,
      serviceType,
      address,
      status: 'PENDING',
      createdAt: Date.now(),
      retryCount: 0,
      lastRetryAt: null,
      history: [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          fromStatus: 'START',
          toStatus: 'PENDING',
          user: customerName,
          notes: 'Booking created by customer.',
        },
      ],
    };
    setBookings((prev) => [newBooking, ...prev]);
    setGlobalHistory((prev) => [newBooking.history[0], ...prev]);
    setIsNewBookingOpen(false);
  };

  const updateStatus = useCallback(
    (bookingId, newStatus, user) => {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId) {
            const event = {
              id: Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
              fromStatus: b.status,
              toStatus: newStatus,
              user,
              notes: `Status changed to ${newStatus}`,
            };

            const updatedBooking = {
              ...b,
              status: newStatus,
              history: [...b.history, event],
              providerId:
                newStatus === 'ASSIGNED'
                  ? activeProvider.id
                  : newStatus === 'PENDING'
                    ? undefined
                    : b.providerId,
              providerName:
                newStatus === 'ASSIGNED'
                  ? activeProvider.name
                  : newStatus === 'PENDING'
                    ? undefined
                    : b.providerName,
            };

            setGlobalHistory((gh) => [event, ...gh]);
            return updatedBooking;
          }
          return b;
        })
      );
    },
    [activeProvider]
  );

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-black pb-20">
      <header className="sticky top-0 z-40 bg-white border-b-4 border-black p-4 md:p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 border-2 border-black rotate-3">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            BookMy<span className="text-[#ffde03]">Helper</span>
          </h1>
        </div>

        {!lockViewMode && (
          <nav className="flex items-center gap-2 bg-black p-1 rounded-sm border-2 border-black">
            <button
              onClick={() => setViewMode('CUSTOMER')}
              className={`px-4 py-2 font-bold uppercase transition-colors ${viewMode === 'CUSTOMER' ? 'bg-[#ffde03] text-black' : 'text-white hover:text-[#ffde03]'}`}
            >
              Customer
            </button>
            <button
              onClick={() => setViewMode('PROVIDER')}
              className={`px-4 py-2 font-bold uppercase transition-colors ${viewMode === 'PROVIDER' ? 'bg-[#ffde03] text-black' : 'text-white hover:text-[#ffde03]'}`}
            >
              Provider
            </button>
            <button
              onClick={() => setViewMode('ADMIN')}
              className={`px-4 py-2 font-bold uppercase transition-colors ${viewMode === 'ADMIN' ? 'bg-[#ffde03] text-black' : 'text-white hover:text-[#ffde03]'}`}
            >
              Admin
            </button>
          </nav>
        )}
      </header>

      <main className="container mx-auto px-4 max-w-6xl">
        {viewMode === 'CUSTOMER' && (
          <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-6xl font-black uppercase tracking-tighter mb-2">My Bookings</h2>
                <p className="text-xl font-bold italic border-l-8 border-[#ffde03] pl-4">
                  Track your requests in real-time.
                </p>
              </div>
              <BrutalButton
                size="lg"
                onClick={() => setIsNewBookingOpen(true)}
                className="rotate-[-2deg] hover:rotate-0"
              >
                <Plus className="mr-2 w-6 h-6" /> Create New Booking
              </BrutalButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookings.length === 0 ? (
                <div className="col-span-full border-4 border-dashed border-black p-12 text-center bg-white neobrutal-shadow">
                  <ClipboardList className="w-20 h-20 mx-auto mb-4 opacity-20" />
                  <p className="text-3xl font-black uppercase text-gray-400">No active bookings found.</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdateStatus={updateStatus}
                    currentUser="Customer"
                  />
                ))                       
              )}
            </div>
          </section>
        )}

        {viewMode === 'PROVIDER' && (
          <section className="space-y-8">
            <div className="bg-blue-400 border-4 border-black p-6 neobrutal-shadow mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserCircle className="w-16 h-16" />
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
                    Logged in as: {activeProvider.name}
                  </h2>
                  <p className="font-bold text-black/70">Role: {activeProvider.specialty} Specialist</p>
                </div>
              </div>
              <select
                className="bg-white border-2 border-black p-2 font-bold focus:outline-none"
                value={activeProvider.id}
                onChange={(e) =>
                  setActiveProvider(MOCK_PROVIDERS.find((p) => p.id === e.target.value))
                }
              >
                {MOCK_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-4xl font-black uppercase tracking-tighter underline decoration-[#ffde03] decoration-8 underline-offset-8 mb-8">
              Assigned Tasks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookings.filter((b) => b.status === 'PENDING' || b.providerId === activeProvider.id).length === 0 ? (
                <div className="col-span-full border-4 border-black p-12 bg-white text-center">
                  <p className="text-2xl font-black uppercase italic">
                    No tasks assigned to you right now. Grab a coffee!
                  </p>
                </div>
              ) : (
                bookings
                  .filter((b) => b.status === 'PENDING' || b.providerId === activeProvider.id)
                  .map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onUpdateStatus={updateStatus}
                      currentUser={activeProvider.name}
                    />
                  ))
              )}
            </div>
          </section>
        )}

        {viewMode === 'ADMIN' && (
          <section className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-pink-400 border-4 border-black p-6 neobrutal-shadow flex items-center justify-between">
                  <div className="font-black">
                    <p className="uppercase text-sm">Active Bookings</p>
                    <p className="text-6xl tracking-tighter">
                      {bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length}
                    </p>
                  </div>
                  <Settings className="w-12 h-12" />
                </div>
                <div className="bg-yellow-300 border-4 border-black p-6 neobrutal-shadow flex items-center justify-between">
                  <div className="font-black">
                    <p className="uppercase text-sm">Failed / Rejected</p>
                    <p className="text-6xl tracking-tighter">
                      {bookings.filter((b) => b.status === 'REJECTED').length}
                    </p>
                  </div>
                  <AlertTriangle className="w-12 h-12" />
                </div>

                <div className="bg-white border-4 border-black p-6 neobrutal-shadow">
                  <h4 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">
                    Global System Log
                  </h4>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {globalHistory.length === 0 && (
                      <p className="text-gray-400 italic font-bold">Waiting for events...</p>
                    )}
                    {globalHistory.map((event) => (
                      <div key={event.id} className="text-sm font-bold border-l-4 border-black pl-3 py-1">
                        <span className="text-xs text-gray-500 block">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="uppercase text-blue-600">{event.user}</span>: {event.fromStatus} →{' '}
                        <span className="text-green-600">{event.toStatus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Master List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-5xl font-black uppercase tracking-tighter">Ops Dashboard</h2>
                  <BrutalButton
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setBookings([]);
                      setGlobalHistory([]);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Clear All
                  </BrutalButton>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onUpdateStatus={updateStatus}
                      currentUser="Admin"
                      showAdminActions
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-8 border-black p-8 max-w-lg w-full neobrutal-shadow relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsNewBookingOpen(false)}
              className="absolute top-4 right-4 bg-red-500 border-2 border-black p-1 hover:bg-red-600"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 underline decoration-[#ffde03] decoration-4">
              Book a Service
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addBooking(formData.get('name'), formData.get('service'), formData.get('address'));
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-black uppercase mb-2">Customer Name</label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full border-4 border-black p-3 font-bold focus:bg-[#ffde03] transition-colors focus:outline-none"
                  placeholder="Who's booking?"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Select Service</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_TYPES.map((type) => (
                    <label key={type.id} className="relative cursor-pointer group">
                      <input type="radio" name="service" value={type.label} required className="peer sr-only" />
                      <div
                        className={`border-2 border-black p-3 font-bold text-sm uppercase transition-all peer-checked:bg-black peer-checked:text-white flex items-center gap-2 hover:translate-x-1`}
                      >
                        {type.icon} {type.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-2">Service Address</label>
                <textarea
                  required
                  name="address"
                  className="w-full border-4 border-black p-3 font-bold focus:bg-[#ffde03] transition-colors focus:outline-none"
                  rows={3}
                  placeholder="Where do we go?"
                ></textarea>
              </div>

              <BrutalButton type="submit" size="lg" className="w-full">
                Launch Booking
              </BrutalButton>
            </form>
          </div>
        </div>
      )}

      {viewMode === 'CUSTOMER' && (
        <div className="fixed bottom-8 right-8 z-30">
          <BrutalButton
            onClick={() => setIsNewBookingOpen(true)}
            size="lg"
            className="rounded-full !p-6 neobrutal-shadow bg-[#ffde03] hover:scale-110 transition-transform"
          >
            <Plus className="w-10 h-10" />
          </BrutalButton>
        </div>
      )}
    </div>
  );
};

export default App;
