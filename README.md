# Women's Safety & SOS System (Full-Stack)

A modern, responsive, and safety-focused application designed to protect women in emergencies. This project demonstrates a production-style architecture using the MERN stack with a focus on usability and real-time tracking.

---

## 🚀 Getting Started

### 1. Backend Setup (Server)
```bash
cd server
npm install
node index.js
```
*Backend runs on: http://localhost:5001*

### 2. Frontend Setup (Client)
```bash
cd client
npm install
npm run dev -- --port 3007
```
*Frontend runs on: http://localhost:3007*

---

## 🧪 Experiment Aims & Explanations

This project was built to fulfill core technical aims. Here is how each is implemented and how to explain them:

### 1. Build responsive and interactive UIs using Tailwind CSS
*   **What it does**: Controls the entire visual identity of the app. It uses a "Soft, Safe, Rounded" design system inspired by modern safety apps.
*   **How to explain**: 
    > "I used **Tailwind CSS v4** to build a mobile-first, responsive interface. By utilizing utility classes like `rounded-[2.5rem]`, `glass-card`, and `soft-shadow`, I created an inviting and non-threatening aesthetic. The UI is interactive—for example, the SOS button uses custom animations (`animate-pulse`) and transitions to provide immediate visual feedback during high-stress situations."

### 2. Experiment based on React Hooks (useState, useEffect, useContext, custom hooks)
*   **What it does**: Manages side effects, dynamic states, and responsive behavior.
*   **How to explain**: 
    > - "I implemented several experiments to showcase my proficiency with React Hooks:"
    > - **`useState`**: Used to track the **Live Window Width** in real-time and manage the **Login/Logout** state across the UI.
    > - **`useEffect`**:
    >   - **Theme Engine**: Implemented a **Light/Dark Mode** toggle in Settings that uses `useEffect` to persist the user's preference in `localStorage` and apply class changes to the root document.
    >   - **Window Event Listeners**: Used to attach and cleanup a 'resize' listener, ensuring the window width pixels update live without memory leaks.
    >   - **Live Tracking**: "Triggers periodic location updates every 10 seconds during an active SOS."

### 3. Manage complex state with Redux or Context API
*   **What it does**: Handles the global state of the application, including the user's authentication session, active SOS status, and trusted contact list.
*   **How to explain**: 
    > "I used **Redux Toolkit** for centralized state management. This is critical for an SOS app because the 'Active Emergency' state needs to be consistent across all pages. If a user triggers an SOS on the Dashboard and navigates to the Contacts page, the 'SOS ACTIVE' pulse remains visible. I used `createAsyncThunk` to handle asynchronous API calls, ensuring a smooth user experience with loading and error states."

### 4. Create secure, production-ready RESTful APIs
*   **What it does**: Hardens the backend against common security threats and ensures consistent error handling.
*   **Documentation**: See [SECURE_API_IMPLEMENTATION.md](./SECURE_API_IMPLEMENTATION.md) for a detailed technical breakdown.
*   **How to explain**: 
    > "I implemented a 'Defense in Depth' strategy to secure the API. This includes **Helmet** for security headers, **Rate Limiting** to prevent brute-force attacks, and **NoSQL Injection protection** via data sanitization. I also built a **Global Error Handler** that provides detailed stack traces in development but clean, user-friendly messages in production, ensuring the application remains robust and professional."

### 5. Implement authentication and user roles with JWT
*   **What it does**: Restricts resource access and distinguishes permissions between a general user and platform administrators.
*   **Documentation**: See [JWT_AUTH_AND_ROLES.md](./JWT_AUTH_AND_ROLES.md) for a detailed technical breakdown.
*   **How to explain**:
    > "I implemented secure token-based authentication using **JSON Web Tokens (JWT)**. Passwords are securely hashed using **bcryptjs**. To provide flexible access management, I extended the user schema with a `role` field and wrote a customizable `restrictTo` middleware. This enables role-based protection—for example, only users with an `admin` role can view global system analytics and full user directories."

### 6. Validating RESTful APIs using Postman
*   **What it does**: Provides complete documentation and end-to-end testing of every backend API endpoint.
*   **How to explain**:
    > "I fully validated all endpoints via **Postman**, mapping user authentication, trusted contact addition, and dynamic location tracking updates during active SOS scenarios. This confirms headers, Bearer tokens, status codes (like 201 Created or 403 Forbidden), and global error handlers respond properly under all test conditions."

### 8. Enable Real-Time Communication via WebSockets
*   **What it does**: Establishes persistent, bidirectional WebSocket channels between clients and the server using **Socket.IO**. Emergency alerts, live map GPS position changes, status updates, trusted contacts, and safe zones sync instantly across open sessions without manual page reloads.
*   **Documentation**: See [REALTIME_WEBSOCKETS_IMPLEMENTATION.md](./REALTIME_WEBSOCKETS_IMPLEMENTATION.md) for full technical details.
*   **How to explain**:
    > "I integrated **Socket.IO** on both Node.js server and React client. WebSocket connection requests require JWT verification during handshake. Active SOS activations, GPS position updates, and status changes are broadcasted in real time to connected rooms (`sos:${id}`, `user:${id}`, `admin_room`), enabling instant multi-client map synchronization and emergency alerts without page refreshes."

---

## 🛡️ Key Features
- **SOS Trigger**: 3-second countdown with immediate location capture.
- **Live Real-Time Map**: Instant position updates via Socket.IO and Leaflet.js.
- **Circle of Trust**: Manage emergency contacts with live real-time sync across devices.
- **Security Zones**: Define safe perimeters (Home, Work) on an interactive map.
- **Activity Log**: View history of all previous emergency alerts.
- **Real-Time WebSockets**: Instant emergency alerts and live GPS tracking across all connected browser sessions.

---

## 🛠️ Technology Stack
- **Frontend**: React, Redux Toolkit, Socket.io-client, Tailwind CSS v4, Lucide Icons, Leaflet.
- **Backend**: Node.js, Express, Socket.IO, MongoDB Atlas, Mongoose, JWT, Bcrypt.js.
