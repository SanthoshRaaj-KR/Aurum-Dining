# Troubleshooting: Takeaway Orders Not Showing in Admin Dashboard

## Issue Description
Takeaway orders are not appearing in the admin dashboard even though the service is configured.

## Potential Causes and Solutions

### 1. Environment Variable Not Set
**Problem:** `VITE_TAKEAWAY_SERVICE_URL` is not defined in the frontend environment.

**Solution:**
```bash
# Copy the example environment file
cp env.example .env

# Edit .env and ensure this line exists:
VITE_TAKEAWAY_SERVICE_URL=http://localhost:3003
```

### 2. Takeaway Service Not Running
**Problem:** The takeaway service is not started or not accessible.

**Solution:**
```bash
# Navigate to takeaway service
cd Backend/takeaway-service

# Install dependencies (if not done)
npm install

# Start the service
npm start

# Check if service is running on http://localhost:3003
```

### 3. Database Connection Issues
**Problem:** Takeaway service cannot connect to MongoDB.

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# Create .env file in takeaway service
cd Backend/takeaway-service
cp env.example .env

# Edit .env with correct MongoDB URI:
MONGO_URI=mongodb://localhost:27017/aurum-takeaway
```

### 4. API Response Structure Mismatch
**Problem:** The admin dashboard expects `response.data.orders` but the API returns a different structure.

**Solution:** ✅ Already fixed - Updated admin dashboard to use `response.data.orders`

### 5. CORS Issues
**Problem:** Frontend cannot access takeaway service due to CORS restrictions.

**Solution:** ✅ Already configured in takeaway service server.js

### 6. Route Configuration Issues
**Problem:** API routes are not properly configured.

**Solution:** ✅ Already fixed - Routes are properly configured

## Debugging Steps

### Step 1: Check Environment Variables
Open browser console and check:
```javascript
console.log('VITE_TAKEAWAY_SERVICE_URL:', import.meta.env.VITE_TAKEAWAY_SERVICE_URL);
```

### Step 2: Test Takeaway Service Health
```bash
# Test if service is running
curl http://localhost:3003/health

# Test if orders endpoint works
curl http://localhost:3003/api/takeaway/admin/orders

# Test if any orders exist
curl http://localhost:3003/test-orders
```

### Step 3: Check Browser Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Refresh admin dashboard
4. Look for requests to takeaway service
5. Check response status and data

### Step 4: Check Console Logs
The admin dashboard now includes detailed logging:
- Takeaway service URL being used
- API response data
- Error details if any

### Step 5: Verify Database
```bash
# Connect to MongoDB
mongosh

# Switch to takeaway database
use aurum-takeaway

# Check if orders exist
db.takeawayorders.find().count()

# Check order structure
db.takeawayorders.findOne()
```

## Common Error Messages and Solutions

### "VITE_TAKEAWAY_SERVICE_URL is not defined"
- Copy env.example to .env
- Restart frontend development server

### "Network Error" or "ECONNREFUSED"
- Takeaway service is not running
- Start the service: `cd Backend/takeaway-service && npm start`

### "404 Not Found"
- Check if the API endpoint is correct
- Verify route configuration in takeaway service

### "500 Internal Server Error"
- Check takeaway service logs
- Verify database connection
- Check MongoDB is running

## Testing the Fix

1. **Start all services:**
   ```bash
   # Terminal 1 - Frontend
   npm run dev
   
   # Terminal 2 - Auth Service
   cd Backend/auth-service && npm start
   
   # Terminal 3 - Table Service
   cd Backend/table-service && npm start
   
   # Terminal 4 - Takeaway Service
   cd Backend/takeaway-service && npm start
   ```

2. **Create a test order:**
   - Go to takeaway page
   - Add items to cart
   - Place an order

3. **Check admin dashboard:**
   - Login as admin
   - Check if the order appears in the orders section

4. **Verify in database:**
   ```bash
   mongosh
   use aurum-takeaway
   db.takeawayorders.find()
   ```

## Additional Debugging

If issues persist, add more logging to the takeaway service:

```javascript
// In Backend/takeaway-service/src/controllers/takeawayController.js
export const getAllTakeawayOrders = async (req, res) => {
  try {
    console.log('getAllTakeawayOrders called with query:', req.query);
    // ... rest of the function
    console.log('Found orders:', orders.length);
    res.json({
      orders,
      pagination: { /* ... */ }
    });
  } catch (error) {
    console.error('Error in getAllTakeawayOrders:', error);
    res.status(500).json({ message: "Error fetching takeaway orders", error: error.message });
  }
};
``` 