# Restaurant Management System - Aurum Dining

A full-stack web application for restaurant table reservations and takeaway orders.

## Features

- **Table Reservations**: Book tables in real-time with conflict prevention
- **Takeaway Ordering**: Place orders for delivery with detailed itemization
- **Order Management**: Track, update, or cancel your reservations and orders
- **Admin Dashboard**: Comprehensive admin interface to manage all orders and reservations
- **Responsive Design**: Smooth animations with Framer Motion across all devices

## Tech Stack

### Frontend
- **React**: UI library for building the user interface
- **React Router**: For client-side routing
- **Framer Motion**: For smooth page transitions and animations
- **Tailwind CSS**: For styling components

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework for Node.js
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB

## Installation

### Prerequisites
- Node.js (v14 or above)
- MongoDB (v4.4 or above)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/restaurant-app.git
   cd restaurant-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd Backend
   npm install

   # Install frontend dependencies
   cd ../
   npm install
   ```

3. **Set up MongoDB**
   - Ensure MongoDB is running on your machine
   - The application will connect to `mongodb://127.0.0.1:27017/restaurantDB`

4. **Start the application**
   ```bash
   # Start the backend server
   cd Backend
   npm start

   # In a new terminal, start the frontend
   cd ../
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173` (or the port shown in your terminal)
   - Backend API: `http://localhost:5001`

## API Endpoints

### Tables
- `GET /tables` - Get all tables
- `GET /reserved-tables?date=YYYY-MM-DD&time=HH:MM` - Get reserved tables for a specific date & time

### Reservations
- `POST /reserve` - Create a new reservation
- `GET /reservation/:orderId` - Get reservation details by ID
- `PUT /update-reservation` - Update an existing reservation
- `DELETE /reservation/:orderId` - Cancel a reservation

### Takeaway Orders
- `POST /takeaway` - Create a new takeaway order
- `GET /takeaway/:orderId` - Get takeaway order details by ID

### Order Tracking
- `GET /orders-by-phone/:phone` - Get all orders (reservations & takeaways) by phone number

### Admin Endpoints
- `GET /admin/reservations` - Get all reservations
- `GET /admin/takeaway-orders` - Get all takeaway orders
- `DELETE /admin/reservations/:orderId` - Cancel a reservation (admin only)
- `DELETE /admin/takeaway-orders/:orderId` - Cancel a takeaway order (admin only)

## Data Models

### Table
- `number`: Table number
- `id`: Unique identifier

### Reservation
- `orderId`: Unique order ID
- `fullName`: Customer's full name
- `phone`: Contact phone number
- `email`: Contact email
- `date`: Reservation date
- `time`: Reservation time
- `guests`: Number of guests
- `tables`: Array of table IDs

### Takeaway Order
- `orderId`: Unique order ID
- `fullName`: Customer's full name
- `phone`: Contact phone number
- `address`: Delivery address
- `items`: Array of ordered items (name, quantity, price)
- `subtotal`: Order subtotal
- `tax`: Basic tax amount
- `acTax`: AC Tax (2%)
- `gst`: GST (8%)
- `deliveryCharge`: Delivery fee
- `total`: Total amount
- `createdAt`: Order timestamp

## Application Routes

- `/` - Home page
- `/select-date-time` - Select reservation date and time
- `/reserve-table` - Table selection page
- `/confirmation` - Reservation confirmation page
- `/menu` - Restaurant menu
- `/order-takeaway` - Takeaway order page
- `/order-confirmation/:orderId` - Order confirmation details
- `/update-or-delete-order` - Manage existing orders
- `/admin-login` - Admin authentication
- `/admin-dashboard` - Admin control panel

## Future Enhancements

- Payment gateway integration
- User authentication
- Real-time order tracking
- Email notifications
- Kitchen management system

## License

This project is licensed under the MIT License.