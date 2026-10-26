# Experiment Aim: Implement Authentication and User Roles with JWT

This document explains the technical implementation of Role-Based Access Control (RBAC) and authentication using JSON Web Tokens (JWT) within the Women SOS backend.
---
## 🛡️ Authentication Flow
### 1. User Registration & Login
*   **Registration**: Users register with their name, email, phone, and password. The password is encrypted using `bcryptjs` before storage in MongoDB.
*   **Login**: When a user logs in, the server validates their credentials. If successful, it generates a JWT containing the user's unique ID.
*   **Token Issuance**: The server sends this token back to the client, which stores it (typically in `localStorage` or `cookies`) for subsequent requests.

### 2. Authorization (Protect Middleware)
*   For all sensitive routes (like managing contacts or triggering SOS), the server uses a `protect` middleware.
*   It checks the `Authorization` header for a `Bearer <token>`.
*   If the token is valid, it decodes the user ID, fetches the user from the database, and attaches it to the request object (`req.user`).
---
## 👥 Role-Based Access Control (RBAC)
We implemented a tiered permission system to demonstrate "User Roles":

### 1. User Model Extension
Added a `role` field to the User schema in `models/User.js`:
```javascript
role: {
  type: String,
  enum: ['user', 'admin'],
  default: 'user'
}
```

### 2. The `restrictTo` Middleware
Created a reusable middleware in `middleware/authMiddleware.js` that checks the `req.user.role` against allowed roles:
```javascript
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const err = new Error('You do not have permission to perform this action');
      err.statusCode = 403;
      err.status = 'fail';
      return next(err);
    }
    next();
  };
};
```

### 3. Implementation Example (Admin Routes)
In `routes/authRoutes.js`, we added a restricted route to view all users:
```javascript
router.get('/users', protect, restrictTo('admin'), authController.getAllUsers);
```
- **Regular Users**: Can log in but cannot access `/api/auth/users` (403 Forbidden).
- **Admins**: Can access the full list of users to manage the platform.
---

## 🧪 Validating RESTful APIs using Postman
To validate the implementation, follow these steps in Postman:

### 1. Register a New User
- **Method**: POST
- **URL**: `http://localhost:5001/api/auth/register`
- **Body (JSON)**:
  ```json
  {
    "name": "Test User",
    "email": "user@test.com",
    "phone": "1234567890",
    "password": "password123"
  }
  ```
- **Check**: Response should contain a `token` and user data with `role: "user"`.

### 2. Test Restricted Route (Access Denied)
- **Method**: GET
- **URL**: `http://localhost:5001/api/auth/users`
- **Headers**: Add `Authorization: Bearer <TOKEN_FROM_STEP_1>`
- **Expected Result**: `403 Forbidden` with message "You do not have permission...".

### 3. Create/Update an Admin User
- Manually update a user in the MongoDB database (via Compass or Atlas) to have `role: "admin"`.

### 4. Test Restricted Route (Access Granted)
- **Method**: GET
- **URL**: `http://localhost:5001/api/auth/users`
- **Headers**: Add `Authorization: Bearer <ADMIN_TOKEN>`
- **Expected Result**: `200 OK` with the list of all users in the database.

### 5. Validate SOS & Contacts
- Use the JWT to test `GET /api/contacts` and `POST /api/sos`.
- The `protect` middleware ensures that only logged-in users can access these personal safety features.
