# BookMyHelper – On-Demand Home Services Marketplace

A full-stack booking lifecycle system for home services where customers request services, the system auto-assigns providers based on specialty, and providers manage their workflow. Built with React + Vite.

---

## Design Decisions & Trade-offs

### Architecture Decisions

**1. Role-Based Access Control (RBAC)**
- **Customers**: Create bookings, cancel bookings, view their own requests
- **Providers**: Accept/reject assignments, start work, complete jobs
- **Admin**: Full system control with manual overrides and observability

**Decision**: Enforce role checks at the UI component level to prevent unauthorized actions.  
**Trade-off**: No backend authentication; roles are client-side for demo purposes.

---

### Auto-Assignment with Specialty Matching

**2. Intelligent Provider Routing**
- System automatically matches service type to provider specialty:
  - "Pro Cleaning" → Cleaning provider
  - "Leak Fixer" → Plumbing provider
  - "Volt Masters" → Electrical provider
  - "Wood Works" → Carpentry provider
  - "Safe Guard" → Security provider

**Decision**: Round-robin rotation if no specialty match found (fallback to any available provider).  
**Trade-off**: No load balancing or availability zones; uses mock availability status.

---

### Retry Logic & Failure Handling

**3. Automatic Retry Mechanism**
- Pending/Rejected bookings auto-assign every 5 seconds
- Max 3 retry attempts before stopping
- Full event logging of each retry attempt

**Decision**: Interval-based retries with explicit state tracking (`retryCount`, `lastRetryAt`).  
**Trade-off**: Simple polling vs. event-driven; async queue not needed for demo scale.

---

### State Management

**4. In-Memory React State**
- All bookings, history, and events stored in component state
- No database or backend persistence

**Decision**: useState/useCallback for simplicity; sufficient for demonstration.  
**Trade-off**: Data lost on page reload; no scaling to multiple users.

**5. Client-side persistence (localStorage)**
- Booking data and history are persisted in `localStorage` under `bmh_state`
- Selected role is stored in `localStorage` key `role`

**Decision**: Persist locally so Customer/Provider/Admin routes share the same state without a backend.  
**Trade-off**: Browser-only persistence; clearing storage or using another browser wipes data.

---

### Event Audit Trail

**5. Immutable History Per Booking**
- Every status change creates an event with:
  - Timestamp, user, old/new status, notes
  - Appended to booking history (never deleted)

**Decision**: Immutable append-only log for observability.  
**Trade-off**: No event filtering/pagination for large datasets.

---

## Assumptions

- **Single Device**: No multi-user sessions; one user per browser tab
- **Availability**: Providers always available (mock `isAvailable: true`)
- **No Persistence**: Data resets on page reload
- **Network**: No real backend API calls; all logic client-side
- **Scale**: Demo with 3 mock providers; production would need real provider database

---

## Quick Start

### Prerequisites
- Node.js (v16+)
- npm

### Installation & Running

```bash
# Clone repository
git clone https://github.com/shreyakumari0911/BOOKMYHELPER.git
cd BOOKMYHELPER

# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser → http://localhost:5173/
```

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build locally
npm run preview
```

---

## How to Use

### Customer View
1. Click **"Create New Booking"**
2. Enter your name, select service type, provide address
3. Click **"Launch Booking"**
4. Track booking status in real-time
5. Cancel if needed

### Provider View
1. Switch to **"Provider"** tab
2. Select your provider from dropdown (Mario, Sasha, or Clean Team)
3. See pending bookings in your specialty
4. **Accept** → Status becomes "ASSIGNED"
5. **Start Work** → Status becomes "IN_PROGRESS"
6. **Complete** → Status becomes "COMPLETED"
7. Can also **Reject** to send back to auto-queue

### Admin View
1. Switch to **"Admin"** tab
2. See real-time stats:
   - Active bookings count
   - Failed/Rejected count
   - Global system event log
3. View all bookings and use **Admin Overrides**:
   - "Reset to Pending" – send back to queue
   - "Force Complete" – close booking
4. Clear all data with **"Clear All"** button

---

## System Behavior

### Booking Lifecycle

```
PENDING (awaiting auto-assign)
    ↓ [Auto-assign after 5s, max 3 retries]
ASSIGNED (provider matched)
    ↓ [Provider clicks "Start Work"]
IN_PROGRESS
    ↓ [Provider clicks "Complete"]
COMPLETED (job done)
```

### Failure Paths

```
PENDING → REJECTED (provider rejects)
    ↓ [Re-enters auto-retry queue]
ASSIGNED → REJECTED
    ↓ [Back to auto-assign with retryCount++]
```

### Cancellation

```
PENDING/ASSIGNED/IN_PROGRESS → CANCELLED (customer cancels)
    ↓ [Booking frozen; no further actions]
```

---

## Project Structure

```
BOOKMYHELPER
├── App.jsx                 # Main app + state management
├── index.jsx              # React entry point
├── index.html             # HTML template
├── constants.jsx          # Service types, status colors
├── components/
│   ├── BookingCard.jsx    # Reusable booking card with role-based actions
│   └── BrutalButton.jsx   # Custom button component
├── vite.config.js         # Vite build config
├── package.json           # Dependencies
└── .gitignore             # Git ignore rules
```

---

## Technology Stack

| Layer | Tech |
|-------|------|
| **UI Framework** | React 19.2 |
| **Build Tool** | Vite 6.2 |
| **Styling** | Tailwind CSS (CDN) |
| **Icons** | Lucide React |
| **State** | React Hooks (useState, useCallback, useEffect) |
| **Design** | Neobrutalist (bold, high-contrast) |

---

## Key Features Implemented

 **Booking Creation** – Customers submit requests  
 **Auto-Assignment** – System assigns providers by specialty every 5s  
 **Retry Logic** – Failed assignments retry up to 3 times  
 **Provider Workflow** – Accept → Start → Complete  
 **Failure Handling** – Rejections, cancellations, overrides  
 **Role-Based UI** – Different screens for customer/provider/admin  
 **Audit Trail** – Full event history with timestamps  
 **System Observability** – Real-time event logs and stats  

---

## Deployment

Deployed on **Netlify**:  
→ Branch: `main`  
→ Build command: `npm run build`  
→ Publish directory: `dist`  

**🚀 Live URL**: https://bookmyhelpercleanfanatics.netlify.app/

---

## Design Notes

**Neobrutalist Aesthetic**
- Bold black borders (4-8px)
- High-contrast colors (yellow `#ffde03` accent)
- Grid-based layouts
- Strong typography (uppercase, black font)
- Playful rotations and shadows

---

## Author

Shreya Kumari  
[GitHub](https://github.com/shreyakumari0911)

---

**Happy Booking! 🎉**

