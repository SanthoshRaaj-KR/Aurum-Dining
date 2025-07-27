import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import bgImage from "/images/hk-background.png";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState([]);
  const [takeawayOrders, setTakeawayOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToCancel, setItemToCancel] = useState(null);
  const [cancelType, setCancelType] = useState(''); // 'reservation' or 'takeaway'

  // Get current user data
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return { 
          userId: user._id, 
          userName: user.name, 
          userEmail: user.email 
        };
      } catch (error) {
        console.error('Error parsing user data:', error);
        return { userId: null, userName: null, userEmail: null };
      }
    }
    
    // Fallback to old keys for backward compatibility
    const userId = localStorage.getItem('userId') || localStorage.getItem('currentUserId');
    const userName = localStorage.getItem('userName') || localStorage.getItem('currentUserName');
    const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('currentUserEmail');
    
    return { userId, userName, userEmail };
  };

  const { userId, userName, userEmail } = getCurrentUser();

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [userId, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Fetch both reservations and takeaway orders in parallel
      const [reservationsResponse, takeawayResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_TABLE_SERVICE_URL}/user/${userId}/reservations`),
        axios.get(`${import.meta.env.VITE_TABLE_SERVICE_URL}/user/${userId}/takeaway-orders`)
      ]);
      
      setReservations(reservationsResponse.data);
      setTakeawayOrders(takeawayResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = (item, type) => {
    setItemToCancel(item);
    setCancelType(type);
    setShowConfirmation(true);
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setItemToCancel(null);
    setCancelType('');
  };

  const handleConfirmCancel = async () => {
    if (!itemToCancel) return;
    
    try {
      setLoading(true);
      
      if (cancelType === 'reservation') {
        await axios.delete(`${import.meta.env.VITE_TABLE_SERVICE_URL}/reservation/${itemToCancel.orderId}`);
        setReservations(prevReservations => 
          prevReservations.filter(res => res.orderId !== itemToCancel.orderId)
        );
      } else if (cancelType === 'takeaway') {
        await axios.delete(`${import.meta.env.VITE_TABLE_SERVICE_URL}/takeaway/${itemToCancel.orderId}`);
        setTakeawayOrders(prevOrders => 
          prevOrders.filter(order => order.orderId !== itemToCancel.orderId)
        );
      }
      
      setShowConfirmation(false);
      setItemToCancel(null);
      setCancelType('');
    } catch (error) {
      console.error('Error cancelling:', error);
      setError(`Failed to cancel ${cancelType}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReservation = (reservation) => {
    localStorage.setItem("updateOrderData", JSON.stringify({
      orderId: reservation.orderId,
      fullName: reservation.fullName,
      phone: reservation.phone,
      email: reservation.email,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.guests,
      tables: reservation.tables,
      isUpdate: true
    }));
    
    navigate("/reserve-table", {
      state: {
        date: reservation.date,
        time: reservation.time,
        isUpdateMode: true
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'confirmed':
      case 'delivered':
        return 'bg-green-900 text-green-200';
      case 'cancelled':
        return 'bg-red-900 text-red-200';
      case 'pending':
        return 'bg-yellow-900 text-yellow-200';
      case 'preparing':
        return 'bg-blue-900 text-blue-200';
      case 'out_for_delivery':
        return 'bg-purple-900 text-purple-200';
      default:
        return 'bg-gray-900 text-gray-200';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'out_for_delivery':
        return 'Out for Delivery';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const isUpcoming = (date, time) => {
    const reservationDateTime = new Date(`${date} ${time}`);
    return reservationDateTime > new Date();
  };

  const canCancelTakeaway = (order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && reservations.length === 0 && takeawayOrders.length === 0) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="bg-black/80 p-8 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="text-white mt-4 text-center">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-12 px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-black/80 backdrop-blur-md p-8 rounded-t-2xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
              <p className="text-gray-300 text-lg">Welcome back, {userName || 'Guest'}!</p>
              {userEmail && (
                <p className="text-gray-400 text-sm">{userEmail}</p>
              )}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-yellow-400 text-2xl font-bold">{reservations.length}</p>
                  <p className="text-gray-300 text-sm">Reservations</p>
                </div>
                <div className="text-center">
                  <p className="text-green-400 text-2xl font-bold">{takeawayOrders.length}</p>
                  <p className="text-gray-300 text-sm">Takeaway Orders</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-black/70 backdrop-blur-md border-x border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'reservations'
                  ? 'bg-yellow-600 text-black'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Table Reservations ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab('takeaway')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'takeaway'
                  ? 'bg-green-600 text-black'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Takeaway Orders ({takeawayOrders.length})
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-black/70 backdrop-blur-md p-8 rounded-b-2xl border border-gray-700 border-t-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {activeTab === 'reservations' ? 'Your Table Reservations' : 'Your Takeaway Orders'}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(activeTab === 'reservations' ? '/select-date-time' : '/order-takeaway')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                activeTab === 'reservations'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400'
              } text-black`}
            >
              + New {activeTab === 'reservations' ? 'Reservation' : 'Order'}
            </motion.button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div>
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation, index) => (
                    <motion.div
                      key={reservation.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900/50 border border-gray-600 rounded-lg p-6 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-xl font-bold text-white">
                              Reservation #{reservation.orderId.substring(0, 8)}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                              {getStatusDisplay(reservation.status)}
                            </span>
                            {isUpcoming(reservation.date, reservation.time) && reservation.status === 'active' && (
                              <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm font-medium">
                                Upcoming
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-400 text-sm">Date & Time</p>
                              <p className="text-white font-medium">
                                {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Guests</p>
                              <p className="text-white font-medium">{reservation.guests} guest{reservation.guests !== 1 ? 's' : ''}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Contact</p>
                              <p className="text-white font-medium">{reservation.phone}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Tables</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {reservation.tables.map((table, idx) => (
                                  <span 
                                    key={idx}
                                    className="bg-yellow-900/50 text-yellow-200 text-xs px-2 py-1 rounded-full border border-yellow-600"
                                  >
                                    Table {table}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Created: {formatDate(reservation.createdAt)}
                            {reservation.updatedAt !== reservation.createdAt && (
                              <span className="ml-4">
                                Updated: {formatDate(reservation.updatedAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {reservation.status === 'active' && isUpcoming(reservation.date, reservation.time) && (
                          <div className="flex flex-col gap-2 ml-6">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateReservation(reservation)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Update
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => confirmCancel(reservation, 'reservation')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Reservations Yet</h3>
                  <p className="text-gray-400 mb-6">You haven't made any table reservations yet.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/select-date-time')}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black px-8 py-3 rounded-lg font-bold text-lg transition-all"
                  >
                    Make Your First Reservation
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {/* Takeaway Orders Tab */}
          {activeTab === 'takeaway' && (
            <div>
              {takeawayOrders.length > 0 ? (
                <div className="space-y-4">
                  {takeawayOrders.map((order, index) => (
                    <motion.div
                      key={order.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900/50 border border-gray-600 rounded-lg p-6 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-xl font-bold text-white">
                              Order #{order.orderId.substring(0, 8)}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusDisplay(order.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-gray-400 text-sm">Order Date</p>
                              <p className="text-white font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Total Amount</p>
                              <p className="text-green-400 font-bold text-lg">₹{order.billing.total.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Delivery Address</p>
                              <p className="text-white font-medium">{order.address}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Items Count</p>
                              <p className="text-white font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="mb-4">
                            <p className="text-gray-400 text-sm mb-2">Items Ordered:</p>
                            <div className="bg-black/30 p-3 rounded border">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm mb-1 last:mb-0">
                                  <span className="text-gray-300">{item.quantity}× {item.name}</span>
                                  <span className="text-green-400">₹{(item.quantity * item.price).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Estimated Delivery */}
                          {order.estimatedDeliveryTime && (
                            <div className="mb-4">
                              <p className="text-gray-400 text-sm">Estimated Delivery</p>
                              <p className="text-white font-medium">{formatDate(order.estimatedDeliveryTime)}</p>
                            </div>
                          )}

                          {/* Notes */}
                          {order.notes && (
                            <div className="mb-4">
                              <p className="text-gray-400 text-sm">Notes</p>
                              <p className="text-white font-medium">{order.notes}</p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500">
                            Created: {formatDate(order.createdAt)}
                            {order.updatedAt !== order.createdAt && (
                              <span className="ml-4">
                                Updated: {formatDate(order.updatedAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {canCancelTakeaway(order) && (
                          <div className="flex flex-col gap-2 ml-6">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => confirmCancel(order, 'takeaway')}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                              Cancel Order
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🥡</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Takeaway Orders Yet</h3>
                  <p className="text-gray-400 mb-6">You haven't placed any takeaway orders yet.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/order-takeaway')}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-black px-8 py-3 rounded-lg font-bold text-lg transition-all"
                  >
                    Place Your First Order
                  </motion.button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
              <h3 className="text-xl font-bold mb-4 text-white">
                Cancel {cancelType === 'reservation' ? 'Reservation' : 'Order'}
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to cancel this {cancelType}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  onClick={cancelAction}
                >
                  Keep {cancelType === 'reservation' ? 'Reservation' : 'Order'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  onClick={handleConfirmCancel}
                  disabled={loading}
                >
                  {loading ? 'Cancelling...' : 'Yes, Cancel It'}
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;