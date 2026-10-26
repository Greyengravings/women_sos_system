# Experiment Aim 8: Enable Real-Time Communication via WebSockets

This document details the architecture, design patterns, security protocols, and testing procedure for **Aim 8: Real-Time Communication via WebSockets** implemented in the **Women SOS** platform.

---

## ⚡ Technical Overview

The real-time communication subsystem enables instant, bidirectional, event-driven data streaming between connected frontend clients and the backend server without requiring manual page reloads or HTTP polling.

### Key Capabilities
- **Real-Time SOS Activation**: When a user triggers an emergency alert, connected clients (trusted contacts, monitoring sessions, admins) receive instant real-time alerts.
- **Live GPS Tracking**: Active SOS coordinates update instantly on live interactive maps across all connected clients.
- **Instant Emergency Status Synchronization**: Marking an SOS as `CLOSED`, `CANCELLED`, or `RESPONDED` immediately updates all open sessions.
- **Live Circle & Safe Zone Sync**: Adding/removing contacts or safe zones synchronizes instantly across devices.
- **Real-Time Account-to-Account Private Messaging**: Users can send and receive instant text messages in real-time across created accounts via WebSockets.
- **Authenticated Socket Connections**: WebSockets require valid JWT tokens during handshake and validate user privileges.

---

## 🏗️ WebSocket Architecture

### 1. Technology Stack
- **Backend Protocol**: Socket.IO (`v4`) running over an HTTP/1.1 & WebSocket server (`http.createServer`).
- **Frontend Client**: `socket.io-client` (`v4`) integrated into React state and Redux Toolkit slices.
- **Configuration**: Dynamic server URL handling via `VITE_SOCKET_URL` (`http://localhost:5001`).

### 2. Connection Lifecycle & Authentication Flow
1. **Handshake**: When an authorized user logs in, the client establishes a Socket.IO connection passing the JWT token in `auth: { token }`.
2. **Middleware Verification**: The server verifies the JWT token using `process.env.JWT_SECRET`, decodes the user profile, and attaches user metadata (`socket.user = { id, name, email, role }`). Unauthenticated or expired tokens are rejected.
3. **Room Subscription**:
   - `user:${userId}`: User-specific private room for targeted sync (contacts, safe zones, private chat messages).
   - `authenticated_users`: Global broadcast room for emergency alerts.
   - `admin_room`: Exclusive channel for users with the `admin` role.
   - `sos:${sosId}`: Dynamic room joined whenever an active SOS map view is open.
4. **Automatic Reconnection & Cleanup**: The socket client handles network drops, auto-reconnects, and unbinds listeners upon component unmount to prevent duplicate updates or memory leaks.

---

## 📡 WebSocket Event Specifications

| Event Name | Direction | Payload Schema | Description |
| :--- | :--- | :--- | :--- |
| `sos_triggered` | Server ➔ Clients | `{ sos, user, timestamp }` | Broadcasted when an SOS emergency is activated. |
| `sos_status_updated` | Server ➔ Clients | `{ sos, userId, status, timestamp }` | Broadcasted when an SOS status changes (`CLOSED`, `CANCELLED`, `RESPONDED`). |
| `sos_location_updated` | Server ➔ Clients | `{ sosId, userId, location, timestamp }` | Broadcasted on live GPS coordinate updates. |
| `send_private_message` | Client ➔ Server | `{ receiverId, text }` | Sends a direct private chat message over WebSockets. |
| `receive_private_message` | Server ➔ Clients | `{ message, sender, receiver, timestamp }` | Delivers direct private chat message in real time to recipient and sender rooms. |
| `contact_updated` | Server ➔ User Room | `{ action, contact, contactId }` | Broadcasted when trusted contacts are added, modified, or removed. |
| `safe_zone_updated` | Server ➔ User Room | `{ action, safeZone, safeZoneId }` | Broadcasted when safe perimeters are created or deleted. |
| `join_sos_room` | Client ➔ Server | `{ sosId }` | Joins a specific SOS tracking room. |
| `leave_sos_room` | Client ➔ Server | `{ sosId }` | Leaves a specific SOS tracking room. |

---

## 📂 Summary of Modified & Created Files

### Created Files
- `server/socket.js`: Server-side Socket.IO initialization, JWT handshake middleware, room management, and event dispatcher exporter.
- `server/models/Message.js`: Database schema for storing private user-to-user chat messages.
- `server/controllers/messageController.js`: Controller handling fetching user list, conversation thread history, and message dispatch.
- `server/routes/messageRoutes.js`: Express router endpoints for `/api/messages`.
- `client/src/services/socketService.js`: Socket.IO client connection manager, room join/leave methods, and reconnection configuration.
- `client/src/components/SocketManager.jsx`: React component managing socket event listeners, Redux dispatchers, live connection status badge, and floating real-time toast alerts.
- `client/src/components/ChatModal.jsx`: Interactive real-time messaging UI for account-to-account text chat.
- `REALTIME_WEBSOCKETS_IMPLEMENTATION.md`: Technical documentation for Aim 8.
- `client/.env` & `client/.env.example`: Environment configuration for WebSocket and REST API endpoints.

### Modified Files
- `server/index.js`: Upgraded to `http.createServer()` with integrated Socket.IO server and mounted `/api/messages`.
- `server/controllers/sosController.js`: Added real-time emissions for `sos_triggered`, `sos_status_updated`, and `sos_location_updated`.
- `server/controllers/contactController.js`: Added real-time emission for `contact_updated`.
- `server/controllers/safeZoneController.js`: Added real-time emission for `safe_zone_updated`.
- `client/src/App.jsx`: Rendered `SocketManager` globally to ensure continuous real-time synchronization.
- `client/src/pages/Dashboard.jsx`: Added "Chat" trigger button and integrated `ChatModal`.
- `client/src/store/slices/sosSlice.js`: Added real-time reducers (`setRealtimeSOS`, `updateRealtimeSOSStatus`, `updateRealtimeSOSLocation`).
- `client/src/store/slices/contactSlice.js`: Added real-time reducer (`handleRealtimeContactUpdate`).
- `client/src/store/slices/safeZoneSlice.js`: Added real-time reducer (`handleRealtimeSafeZoneUpdate`).
- `README.md`: Updated with Aim 8 details and verification procedure.

---

## 🧪 Step-by-Step Procedure to Test Real-Time Communication & Private Messaging

### Step 1: Start Backend Server
```bash
cd server
npm install
node index.js
```
*Expected Console Log*: `Server and WebSocket server running on port 5001`

### Step 2: Start Frontend Application
```bash
cd client
npm install
npm run dev -- --port 3007
```
*Expected App URL*: `http://localhost:3007`

### Step 3: Test Real-Time Multi-Client Sync & Chat
1. **Open Session 1**: Open Google Chrome, go to `http://localhost:3007`, and register/log in as **User A** (e.g. `userA@example.com`).
2. **Observe Connection Badge**: Bottom-right corner displays **"🟢 Real-Time Sync Active"**.
3. **Open Session 2**: Open an Incognito/Private window or second browser (Firefox/Safari), go to `http://localhost:3007`, and register/log in as **User B** (e.g. `userB@example.com`).
4. **Test Real-Time Private Chat**:
   - In **Session 1**, click the **Chat** icon in the header or user card.
   - Select **User B** from the user list.
   - Type a message (e.g. `"Hello User B! Testing real-time WebSockets text messaging."`) and press Send.
   - **Session 2 Outcome**: Instantly receives a floating alert toast **"💬 Message from User A: Hello User B..."**!
   - In **Session 2**, open the **Chat** window and select **User A**.
   - Type `"Received loud and clear!"` and press Send.
   - **Session 1 Outcome**: The message streams into Session 1's chat bubble thread in real time without refreshing!
5. **Trigger SOS Emergency (Session 1)**:
   - Click the **SOS** button in Session 1.
   - **Session 2 Outcome**: Instantly receives a floating alert **"🚨 LIVE ALERT: Emergency SOS Activated!"**, active state updates immediately, and live map marker updates without refreshing!

---

## 🛡️ Security & Reliability Verification

1. **JWT Verification**: Unauthenticated WebSocket connections without a valid Bearer token are rejected immediately during the socket handshake.
2. **Scoped Broadcasting**: Private messages are strictly scoped to the sender and recipient's `user:${userId}` rooms.
3. **No Credential Leaks**: Passwords and sensitive internal database credentials are never sent over socket payloads.
4. **Duplicate Prevention**: Event listeners use clean React `useEffect` unbind returns, ensuring zero memory leaks or duplicate socket triggers.
