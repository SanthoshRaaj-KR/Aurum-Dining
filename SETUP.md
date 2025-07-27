# Aurum Dining Setup Guide

## Issues Fixed

### 1. Missing Environment Files
All services were missing `.env` files. You need to create the following:

#### Frontend (.env)
```bash
# Copy env.example to .env in the root directory
cp env.example .env
```

Then edit `.env` with your actual values:
```
VITE_AUTH_SERVICE_URL=http://localhost:5000
VITE_TABLE_SERVICE_URL=http://localhost:5002
VITE_TAKEAWAY_SERVICE_URL=http://localhost:3003
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

#### Auth Service (.env)
```bash
# Copy env.example to .env in Backend/auth-service/
cd Backend/auth-service
cp env.example .env
```

Then edit `.env` with your actual values:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/aurum-auth
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
NODE_ENV=development
```

#### Table Service (.env)
```bash
# Copy env.example to .env in Backend/table-service/
cd Backend/table-service
cp env.example .env
```

Then edit `.env` with your actual values:
```
PORT=5002
MONGO_URI=mongodb://localhost:27017/aurum-tables
NODE_ENV=development
```

#### Takeaway Service (.env)
```bash
# Copy env.example to .env in Backend/takeaway-service/
cd Backend/takeaway-service
cp env.example .env
```

Then edit `.env` with your actual values:
```
PORT=3003
MONGO_URI=mongodb://localhost:27017/aurum-takeaway
NODE_ENV=development
```

### 2. Takeaway Service Issues Fixed

#### Problems Found:
- ❌ Server.js was incorrectly copied from table service
- ❌ Missing database configuration
- ❌ Missing dependencies (mongoose)
- ❌ Route conflicts in takeaway routes
- ❌ Frontend using wrong service URLs

#### Fixes Applied:
- ✅ Created proper takeaway service server.js
- ✅ Added database configuration
- ✅ Updated package.json with missing dependencies
- ✅ Fixed route ordering to prevent conflicts
- ✅ Updated frontend to use dedicated takeaway service

### 3. Dependencies Installation

Install dependencies for all services:

```bash
# Frontend
npm install

# Auth Service
cd Backend/auth-service
npm install

# Table Service
cd Backend/table-service
npm install

# Takeaway Service
cd Backend/takeaway-service
npm install
```

### 4. Database Setup

Make sure MongoDB is running locally or update the MONGO_URI in each service's .env file to point to your MongoDB instance.

### 5. Running the Services

#### Terminal 1 - Frontend
```bash
npm run dev
```

#### Terminal 2 - Auth Service
```bash
cd Backend/auth-service
npm start
```

#### Terminal 3 - Table Service
```bash
cd Backend/table-service
npm start
```

#### Terminal 4 - Takeaway Service
```bash
cd Backend/takeaway-service
npm start
```

### 6. Service URLs

- Frontend: http://localhost:5173
- Auth Service: http://localhost:5000
- Table Service: http://localhost:5002
- Takeaway Service: http://localhost:3003

### 7. API Endpoints

#### Auth Service
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/google-auth

#### Table Service
- GET /api/tables
- POST /api/reserve
- GET /api/reserved-tables
- GET /api/user/:userId/reservations
- GET /api/admin/reservations

#### Takeaway Service
- POST /api/takeaway
- GET /api/takeaway/:orderId
- GET /api/takeaway/user/:userId
- GET /api/takeaway/admin/orders
- PUT /api/takeaway/admin/:orderId/status
- DELETE /api/takeaway/:orderId

### 8. Google OAuth Setup

1. Go to Google Cloud Console
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - http://localhost:5000/api/auth/google/callback
6. Copy Client ID and Client Secret to auth service .env file

### 9. Security Notes

- Generate strong random strings for JWT secrets
- Never commit .env files to version control
- Use environment-specific configurations for production
- Consider using a secrets management service in production

### 10. Testing

After setup, test the following:
1. User registration and login
2. Table reservations
3. Takeaway orders
4. Admin dashboard functionality
5. Google OAuth integration 