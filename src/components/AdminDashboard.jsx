import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import ReservationsBarChart from './ReservationsBarChart';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [showAddTable, setShowAddTable] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: 2,
    position: { x: 100, y: 100 }
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
    } else {
      fetchAllData();
    }
  }, [navigate]);
  
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchOrders(),
        fetchReservations(),
        fetchTables()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrders = async () => {
    try {
      console.log('Takeaway service URL:', import.meta.env.VITE_TAKEAWAY_SERVICE_URL);
      console.log('Fetching orders from:', `${import.meta.env.VITE_TAKEAWAY_SERVICE_URL}/api/takeaway/admin/orders`);
      
      if (!import.meta.env.VITE_TAKEAWAY_SERVICE_URL) {
        console.error('VITE_TAKEAWAY_SERVICE_URL is not defined');
        setOrders([]);
        return;
      }
      
      const response = await axios.get(`${import.meta.env.VITE_TAKEAWAY_SERVICE_URL}/api/takeaway/admin/orders`);
      console.log('Orders response:', response.data);
      console.log('Orders array:', response.data.orders);
      console.log('First order structure:', response.data.orders?.[0]);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setOrders([]);
    }
  };
  
  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_TABLE_SERVICE_URL}/admin/reservations`);
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_TABLE_SERVICE_URL}/admin/tables`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };
  
  const confirmDelete = (id, type) => {
    setItemToDelete(id);
    setDeleteType(type);
    setShowConfirmation(true);
  };
  
  const cancelDelete = () => {
    setShowConfirmation(false);
    setItemToDelete(null);
    setDeleteType('');
  };
  
  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'order') {
        await axios.delete(`${import.meta.env.VITE_TAKEAWAY_SERVICE_URL}/api/takeaway/${itemToDelete}`);
        fetchOrders();
      } else if (deleteType === 'reservation') {
        await axios.delete(`${import.meta.env.VITE_TABLE_SERVICE_URL}/admin/reservations/${itemToDelete}`);
        fetchReservations();
        fetchTables(); // Refresh tables to update status
      } else if (deleteType === 'table') {
        await axios.delete(`${import.meta.env.VITE_TABLE_SERVICE_URL}/admin/tables/${itemToDelete}`);
        fetchTables();
      }
      setShowConfirmation(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleTableStatusChange = async (tableNumber, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_TABLE_SERVICE_URL}/admin/tables/${tableNumber}/status`, {
        status: newStatus
      });
      fetchTables();
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_TABLE_SERVICE_URL}/admin/tables`, newTable);
      setNewTable({
        tableNumber: '',
        capacity: 2,
        position: { x: 100, y: 100 }
      });
      setShowAddTable(false);
      fetchTables();
    } catch (error) {
      console.error('Error adding table:', error);
      alert('Error adding table. Table number might already exist.');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`${import.meta.env.VITE_TAKEAWAY_SERVICE_URL}/api/takeaway/admin/${orderId}/status`, {
        status: newStatus
      });
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status. Please try again.');
    }
  };

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const confirmed = orders.filter(order => order.status === 'confirmed').length;
    const preparing = orders.filter(order => order.status === 'preparing').length;
    const outForDelivery = orders.filter(order => order.status === 'out_for_delivery').length;
    const delivered = orders.filter(order => order.status === 'delivered').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;

    return { total, pending, confirmed, preparing, outForDelivery, delivered, cancelled };
  };

  const getFilteredOrders = () => {
    if (orderStatusFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === orderStatusFilter);
  };

  const getReservationStats = () => {
    const total = reservations.length;
    const active = reservations.filter(res => res.status === 'active').length;
    const cancelled = reservations.filter(res => res.status === 'cancelled').length;

    return { total, active, cancelled };
  };
  
  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  const getTablesByStatus = () => {
    const available = tables.filter(t => t.status === 'available').length;
    const reserved = tables.filter(t => t.status === 'reserved').length;
    const maintenance = tables.filter(t => t.status === 'maintenance').length;
    return { available, reserved, maintenance };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const tableStats = getTablesByStatus();
  
  return (
    <div className="container mx-auto pb-12 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-6 pt-4">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          onClick={handleLogout}
        >
          Logout
        </motion.button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        {['overview', 'tables', 'reservations', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md capitalize transition-colors ${
              activeTab === tab
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Total Tables</h3>
              <p className="text-2xl font-bold text-yellow-500">{tables.length}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Available</h3>
              <p className="text-2xl font-bold text-green-500">{tableStats.available}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Reserved</h3>
              <p className="text-2xl font-bold text-red-500">{tableStats.reserved}</p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">Maintenance</h3>
              <p className="text-2xl font-bold text-orange-500">{tableStats.maintenance}</p>
            </div>
          </div>

          {/* Charts */}
          <ReservationsBarChart reservations={reservations} />
        </div>
      )}

      {/* Tables Tab */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Table Management</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              onClick={() => setShowAddTable(true)}
            >
              Add New Table
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div key={table._id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Table {table.tableNumber}</h3>
                    <p className="text-gray-400">{table.capacity} seater</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    table.status === 'available' ? 'bg-green-900 text-green-200' :
                    table.status === 'reserved' ? 'bg-red-900 text-red-200' :
                    'bg-orange-900 text-orange-200'
                  }`}>
                    {table.status}
                  </span>
                </div>
                
                {table.reservedBy && (
                  <p className="text-sm text-gray-400 mb-3">
                    Reserved by: {table.reservedBy.substring(0, 8)}...
                  </p>
                )}

                <div className="flex space-x-2">
                  <select
                    value={table.status}
                    onChange={(e) => handleTableStatusChange(table.tableNumber, e.target.value)}
                    className="flex-1 bg-gray-800 text-white p-2 rounded text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                    onClick={() => confirmDelete(table.tableNumber, 'table')}
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="bg-black bg-opacity-90 rounded-lg border border-gray-800 shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-white">Reservations</h2>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {reservations.length > 0 ? (
              reservations.map((reservation) => (
                <ReservationCard 
                  key={reservation.orderId}
                  reservation={reservation}
                  onCancel={() => confirmDelete(reservation.orderId, 'reservation')}
                />
              ))
            ) : (
              <p className="text-gray-400 italic">No reservations found</p>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-black bg-opacity-90 rounded-lg border border-gray-800 shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-bold text-white">Takeaway Orders</h2>
            <div className="flex items-center gap-4">
              <label className="text-gray-300 text-sm">Filter by Status:</label>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-600 text-sm"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          {/* Order Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
            {(() => {
              const stats = getOrderStats();
              return [
                { label: 'Total', value: stats.total, color: 'text-white' },
                { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
                { label: 'Confirmed', value: stats.confirmed, color: 'text-blue-400' },
                { label: 'Preparing', value: stats.preparing, color: 'text-orange-400' },
                { label: 'Out for Delivery', value: stats.outForDelivery, color: 'text-purple-400' },
                { label: 'Delivered', value: stats.delivered, color: 'text-green-400' },
                { label: 'Cancelled', value: stats.cancelled, color: 'text-red-400' }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-900 p-3 rounded-lg border border-gray-700 text-center">
                  <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ));
            })()}
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {getFilteredOrders().length > 0 ? (
              getFilteredOrders().map((order) => (
                <OrderCard 
                  key={order.orderId}
                  order={order}
                  onCancel={() => confirmDelete(order.orderId, 'order')}
                  onStatusUpdate={handleOrderStatusUpdate}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🥡</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {orderStatusFilter === 'all' ? 'No Takeaway Orders' : `No ${orderStatusFilter} Orders`}
                </h3>
                <p className="text-gray-400">
                  {orderStatusFilter === 'all' 
                    ? 'No takeaway orders have been placed yet.' 
                    : `No orders with status "${orderStatusFilter}" found.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {showAddTable && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Add New Table</h3>
            <form onSubmit={handleAddTable}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Table Number</label>
                  <input
                    type="number"
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({...newTable, tableNumber: e.target.value})}
                    className="w-full bg-gray-800 text-white p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Capacity</label>
                  <select
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                    className="w-full bg-gray-800 text-white p-2 rounded"
                  >
                    <option value={2}>2 seater</option>
                    <option value={3}>3 seater</option>
                    <option value={4}>4 seater</option>
                    <option value={5}>5 seater</option>
                    <option value={6}>6 seater</option>
                  </select>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-gray-300 mb-2">Position X</label>
                    <input
                      type="number"
                      value={newTable.position.x}
                      onChange={(e) => setNewTable({
                        ...newTable, 
                        position: {...newTable.position, x: parseInt(e.target.value)}
                      })}
                      className="w-full bg-gray-800 text-white p-2 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-300 mb-2">Position Y</label>
                    <input
                      type="number"
                      value={newTable.position.y}
                      onChange={(e) => setNewTable({
                        ...newTable, 
                        position: {...newTable.position, y: parseInt(e.target.value)}
                      })}
                      className="w-full bg-gray-800 text-white p-2 rounded"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  onClick={() => setShowAddTable(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  Add Table
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-white">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                onClick={cancelDelete}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={handleConfirmDelete}
              >
                Delete
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, onCancel, onStatusUpdate }) => {
  if (!order) {
    return <div className="bg-gray-900 rounded-lg shadow p-4 border-l-4 border-yellow-500">
      <p className="text-white">Order data not available</p>
    </div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900 text-yellow-200';
      case 'confirmed': return 'bg-blue-900 text-blue-200';
      case 'preparing': return 'bg-orange-900 text-orange-200';
      case 'out_for_delivery': return 'bg-purple-900 text-purple-200';
      case 'delivered': return 'bg-green-900 text-green-200';
      case 'cancelled': return 'bg-red-900 text-red-200';
      default: return 'bg-gray-900 text-gray-200';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'out_for_delivery': return 'Out for Delivery';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const canUpdateStatus = (currentStatus) => {
    return !['delivered', 'cancelled'].includes(currentStatus);
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'out_for_delivery',
      'out_for_delivery': 'delivered'
    };
    return statusFlow[currentStatus];
  };
  
  return (
    <div className="bg-gray-900 rounded-lg shadow p-4 border-l-4 border-yellow-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <h3 className="font-bold text-lg text-white">Order #{order.orderId?.substring(0, 8) || 'N/A'}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusDisplay(order.status)}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">
            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          {canUpdateStatus(order.status) && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStatusUpdate(order.orderId, getNextStatus(order.status))}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Update Status
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
            onClick={onCancel}
          >
            Cancel
          </motion.button>
        </div>
      </div>
      
      <div className="mt-3 text-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p><span className="font-medium text-white">Customer:</span> {order.fullName || 'N/A'}</p>
            <p><span className="font-medium text-white">Phone:</span> {order.phone || 'N/A'}</p>
          </div>
          <div>
            <p><span className="font-medium text-white">Address:</span> {order.address || 'N/A'}</p>
            <p><span className="font-medium text-white">Total:</span> ₹{order.billing?.total?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium text-white mb-2">Items:</h4>
          <div className="bg-black/30 p-3 rounded border">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm mb-1 last:mb-0">
                <span className="text-gray-300">{item.quantity}× {item.name}</span>
                <span className="text-green-400">₹{(item.quantity * (item.price || 0)).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {order.estimatedDeliveryTime && (
          <div className="mb-2">
            <p className="text-gray-400 text-sm">Estimated Delivery:</p>
            <p className="text-white">{new Date(order.estimatedDeliveryTime).toLocaleString()}</p>
          </div>
        )}

        {order.notes && (
          <div className="mb-2">
            <p className="text-gray-400 text-sm">Notes:</p>
            <p className="text-white">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ReservationCard = ({ reservation, onCancel }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow p-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-white">Reservation #{reservation.orderId.substring(0, 8)}</h3>
          <p className="text-sm text-gray-400">
            {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
          onClick={onCancel}
        >
          Cancel
        </motion.button>
      </div>
      
      <div className="mt-3 text-gray-300">
        <p><span className="font-medium text-white">Customer:</span> {reservation.fullName}</p>
        <p><span className="font-medium text-white">Phone:</span> {reservation.phone}</p>
        <p><span className="font-medium text-white">Email:</span> {reservation.email}</p>
        <p><span className="font-medium text-white">Guests:</span> {reservation.guests}</p>
        
        <div className="mt-2">
          <h4 className="font-medium text-white">Tables:</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {reservation.tables.map((table, index) => (
              <span 
                key={index}
                className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded-full"
              >
                Table {table}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;