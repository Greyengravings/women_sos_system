# Experiment Aim: Create Secure, Production-Ready RESTful APIs

This document explains the implementation of advanced security measures and production-grade features in the Women SOS backend.

---

## 🛡️ Security Implementations

### 1. Security HTTP Headers (Helmet)
*   **What it does**: Sets various HTTP headers to help protect the app from common web vulnerabilities.
*   **Implementation**: Integrated the `helmet` middleware.
*   **Why**: It helps prevent attacks like Cross-Site Scripting (XSS), clickjacking, and MIME-sniffing by configuring headers like `Content-Security-Policy`, `X-Frame-Options`, etc.

### 2. Rate Limiting
*   **What it does**: Limits the number of requests a single user (IP address) can make within a specific timeframe.
*   **Implementation**: Used `express-rate-limit` to restrict IPs to 100 requests per hour for the `/api` routes.
*   **Why**: Prevents brute-force attacks on the login system and mitigates Denial of Service (DoS) attacks.

### 3. Data Sanitization (NoSQL Injection)
*   **What it does**: Cleans user-provided data to prevent malicious NoSQL queries.
*   **Implementation**: Integrated `express-mongo-sanitize`.
*   **Why**: Attackers might try to inject MongoDB operators (like `$gt`) into login forms to bypass authentication. This middleware strips out these operators from `req.body`, `req.query`, and `req.params`.

### 4. Parameter Pollution Prevention (HPP)
*   **What it does**: Prevents attackers from sending multiple parameters with the same name in the query string.
*   **Implementation**: Integrated the `hpp` middleware.
*   **Why**: This helps avoid unexpected behavior in the application logic when handling query strings (e.g., `?sort=name&sort=email`).

### 5. Body Size Limiting
*   **What it does**: Restricts the size of the request payload.
*   **Implementation**: Configured `express.json({ limit: '10kb' })`.
*   **Why**: Large payloads can be used to overwhelm the server's memory, leading to a crash (DoS).

### 6. CORS (Cross-Origin Resource Sharing)
*   **What it does**: Restricts which domains are allowed to access the API.
*   **Implementation**: Configured to specifically allow the frontend origin (`http://localhost:5173`) and handle preflight `OPTIONS` requests as the first middleware in the stack.
*   **Why**: Prevents unauthorized websites from making requests to the API on behalf of a user.

---

## 🏗️ Production-Ready Features

### 1. Global Error Handling Middleware
*   **Implementation**: Created a centralized error-handling function that catches all errors across the application.
*   **How it works**:
    - Handles "404 Not Found" for undefined routes.
    - Distinguishes between **Operational Errors** (e.g., validation failed) and **Programming Errors** (e.g., bugs).
    - In **Development**, it provides full stack traces for easier debugging.
    - In **Production**, it sends user-friendly messages without exposing internal code details.

### 2. Environment-Specific Configuration
*   **Implementation**: Used `dotenv` to manage secrets and environment variables.
*   - Logic branches for `development` vs `production` modes (e.g., logging with `morgan` only in development).

### 3. JWT Authentication Best Practices
*   - Secure password hashing using `bcryptjs`.
*   - Token expiration set to 30 days.
*   - Passwords are explicitly excluded from API responses (`user.password = undefined`).

---

## 🧪 How to Explain This Aim
> "I upgraded the backend from a basic REST API to a **production-ready secure system**. I implemented a 'Defense in Depth' strategy: first, by using **Helmet** for secure headers; second, by adding **Rate Limiting** to prevent brute-force; and third, by using **Data Sanitization** to block NoSQL injection attacks. I also centralized the error handling to ensure the API never crashes silently and always returns a consistent JSON response, even for 404s or internal server errors."
