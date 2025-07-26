import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import bgImage from "/images/hk-background.png";
import Navbar from "./Navbar";

const TableSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { date, time, isUpdateMode: locationIsUpdateMode } = location.state || {};

  const [tables, setTables] = useState([]);
  const [reservedTables, setReservedTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [isUpdateMode, setIsUpdateMode] = useState(locationIsUpdateMode || false);
  const [updateData, setUpdateData] = useState(null);
  const [originalOrderId, setOriginalOrderId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    guests: "1",
    agree: false,
  });

  // Check for update data in localStorage
  useEffect(() => {
    const storedUpdateData = localStorage.getItem("updateOrderData");
    
    if (storedUpdateData) {
      try {
        const parsedData = JSON.parse(storedUpdateData);
        setIsUpdateMode(true);
        setUpdateData(parsedData);
        setOriginalOrderId(parsedData.orderId);
        
        setFormData({
          fullName: parsedData.fullName || "",
          phone: parsedData.phone || "",
          email: parsedData.email || "",
          guests: String(parsedData.guests) || "1",
          agree: true,
        });
        
        if (parsedData.tables && Array.isArray(parsedData.tables)) {
          setSelectedTables(parsedData.tables);
        }
      } catch (error) {
        console.error("Error parsing update data:", error);
      }
    }
  }, []);

  // Load tables and reserved tables
  useEffect(() => {
    const effectiveDate = isUpdateMode && updateData ? updateData.date : date;
    const effectiveTime = isUpdateMode && updateData ? updateData.time : time;
    
    if (!effectiveDate || !effectiveTime) {
      if (!isUpdateMode || !updateData) {
        navigate("/");
        return;
      }
    }

    // Fetch all available tables
    axios.get("http://localhost:5001/tables").then((response) => {
      setTables(response.data);
    });

    // Fetch reserved tables for the given date and time
    axios
      .get(`http://localhost:5001/reserved-tables?date=${effectiveDate}&time=${effectiveTime}`)
      .then((response) => {
        let allReservedTables = response.data;
        
        if (isUpdateMode && updateData && updateData.tables) {
          allReservedTables = allReservedTables.filter(
            tableId => !updateData.tables.includes(tableId)
          );
        }
        
        setReservedTables(allReservedTables);
      })
      .catch(error => {
        console.error("Error fetching reserved tables:", error);
      });
  }, [date, time, navigate, isUpdateMode, updateData]);

  const toggleTableSelection = (tableNumber) => {
    const tableNumberStr = String(tableNumber);
    
    // Don't allow selection of reserved tables
    if (reservedTables.includes(tableNumberStr)) return;
    
    setSelectedTables((prev) =>
      prev.includes(tableNumberStr)
        ? prev.filter((id) => id !== tableNumberStr)
        : [...prev, tableNumberStr]
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (name === "phone") {
      newValue = newValue.replace(/[^0-9]/g, "").slice(0, 10);
    }
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.fullName || !formData.phone || !formData.email || !formData.agree) {
      alert("Please fill in all required fields.");
      return;
    }
    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }
    if (selectedTables.length === 0) {
      alert("Please select at least one table to reserve.");
      return;
    }
  
    const effectiveDate = isUpdateMode && updateData ? updateData.date : date;
    const effectiveTime = isUpdateMode && updateData ? updateData.time : time;
    
    const reservationData = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      guests: Number(formData.guests),
      date: effectiveDate,
      time: effectiveTime,
      tables: selectedTables,
    };

    try {
      if (isUpdateMode && originalOrderId) {
        await axios.delete(`http://localhost:5001/reservation/${originalOrderId}`);
        const response = await axios.post("http://localhost:5001/reserve", reservationData);
        const { orderId } = response.data;
        
        if (!orderId) {
          alert("Update failed. No order ID received.");
          return;
        }
        
        navigate("/confirmation", {
          state: { 
            ...reservationData,
            orderId,
            isUpdated: true 
          },
        });
      } else {
        const response = await axios.post("http://localhost:5001/reserve", reservationData);
        const { orderId } = response.data;
        
        if (!orderId) {
          alert("Reservation failed. No order ID received.");
          return;
        }
        
        navigate("/confirmation", {
          state: { orderId, ...reservationData },
        });
      }
      
      localStorage.removeItem("updateOrderData");
    } catch (err) {
      console.error("Error:", err);
      alert("Reservation failed. Try again.");
    }
  };

  // Enhanced Table component with realistic design
  const TableComponent = ({ table }) => {
    const isSelected = selectedTables.includes(String(table.tableNumber));
    const isReserved = reservedTables.includes(String(table.tableNumber));
    const isMaintenace = table.status === 'maintenance';
    
    let tableColor = "bg-green-500 hover:bg-green-400 shadow-green-500/50"; // Available
    let borderColor = "border-green-400";
    let textColor = "text-white";
    let shadowColor = "shadow-green-500/30";
    
    if (isMaintenace) {
      tableColor = "bg-orange-500";
      borderColor = "border-orange-400";
      textColor = "text-white";
      shadowColor = "shadow-orange-500/30";
    } else if (isReserved) {
      tableColor = "bg-red-500";
      borderColor = "border-red-400";
      textColor = "text-white";  
      shadowColor = "shadow-red-500/30";
    } else if (isSelected) {
      tableColor = "bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/50";
      borderColor = "border-yellow-400";
      textColor = "text-black";
      shadowColor = "shadow-yellow-500/30";
    }

    // Different sizes based on capacity
    const getTableDimensions = (capacity) => {
      switch (capacity) {
        case 2: return { width: "60px", height: "40px", borderRadius: "8px" };
        case 3: return { width: "65px", height: "45px", borderRadius: "12px" };
        case 4: return { width: "70px", height: "50px", borderRadius: "50%" };
        case 5: return { width: "80px", height: "55px", borderRadius: "25px" };
        case 6: return { width: "85px", height: "60px", borderRadius: "30px" };
        default: return { width: "60px", height: "40px", borderRadius: "8px" };
      }
    };

    const dimensions = getTableDimensions(table.capacity);

    // Calculate position with proper scaling
    const leftPercent = Math.min(Math.max((table.position?.x || 100) / 600 * 100, 5), 85);
    const topPercent = Math.min(Math.max((table.position?.y || 100) / 650 * 100, 5), 85);

    return (
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${leftPercent}%`,
          top: `${topPercent}%`
        }}
      >
        <button
          className={`
            ${tableColor} 
            border-2 ${borderColor}
            flex flex-col items-center justify-center
            transition-all duration-300 shadow-lg ${shadowColor}
            ${!isReserved && !isMaintenace ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-75'}
            font-bold text-sm
          `}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            borderRadius: dimensions.borderRadius
          }}
          onClick={() => toggleTableSelection(table.tableNumber)}
          disabled={isReserved || isMaintenace}
        >
          <span className={textColor}>
            {table.tableNumber}
          </span>
          <span className={`text-xs ${textColor} opacity-80`}>
            {table.capacity}p
          </span>
        </button>
        
        {/* Chair indicators around the table */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: table.capacity }, (_, i) => {
            const angle = (i / table.capacity) * 2 * Math.PI - Math.PI/2; // Start from top
            const radiusX = (parseInt(dimensions.width) / 2) + 20;
            const radiusY = (parseInt(dimensions.height) / 2) + 20;
            const chairX = Math.cos(angle) * radiusX;
            const chairY = Math.sin(angle) * radiusY;
            
            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gray-800 rounded-sm transform -translate-x-1/2 -translate-y-1/2 border border-gray-600"
                style={{
                  left: `calc(50% + ${chairX}px)`,
                  top: `calc(50% + ${chairY}px)`
                }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex justify-between items-start min-h-screen bg-repeat bg-[length:100px_100px] bg-center p-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <Navbar />

      {/* Restaurant Layout */}
      <div className="w-[70%] h-[800px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl shadow-2xl relative overflow-hidden border-4 border-amber-200">
        {/* Restaurant Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 to-orange-100/30"></div>
        
        {/* Restaurant Header */}
        <div className="absolute top-6 left-6 right-6 h-16 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xl tracking-wide">🍽️ Restaurant Floor Plan 🍽️</span>
        </div>
        
        {/* Kitchen Area */}
        <div className="absolute top-6 right-6 w-36 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl border-2 border-gray-500 flex items-center justify-center shadow-lg">
          <span className="text-gray-800 font-bold text-sm">👨‍🍳 Kitchen</span>
        </div>
        
        {/* Bar Counter */}
        <div className="absolute bottom-6 left-6 w-52 h-20 bg-gradient-to-r from-amber-800 via-orange-800 to-red-800 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold">🍷 Bar Counter</span>
        </div>
        
        {/* Entrance */}
        <div className="absolute bottom-6 right-6 w-28 h-20 bg-gradient-to-t from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">🚪 Exit</span>
        </div>
        
        {/* Main Dining Area */}
        <div className="absolute inset-6 top-28 bottom-32 bg-white/20 rounded-xl border-2 border-dashed border-amber-300">
          {/* Tables */}
          {tables.map((table) => (
            <TableComponent key={table._id || table.id} table={table} />
          ))}
        </div>
        
        {/* Legend */}
        <div className="absolute top-28 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-amber-200">
          <h3 className="font-bold text-gray-800 mb-3 text-center">Table Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded mr-3 border border-green-400"></div>
              <span className="text-gray-700 font-medium">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-yellow-500 rounded mr-3 border border-yellow-400"></div>
              <span className="text-gray-700 font-medium">Selected</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-500 rounded mr-3 border border-red-400"></div>
              <span className="text-gray-700 font-medium">Reserved</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-orange-500 rounded mr-3 border border-orange-400"></div>
              <span className="text-gray-700 font-medium">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Capacity Guide */}
        <div className="absolute bottom-32 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-amber-200">
          <h3 className="font-bold text-gray-800 mb-3 text-center">Table Sizes</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">2-seater:</span>
              <div className="w-4 h-3 bg-gray-300 rounded border"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">3-seater:</span>
              <div className="w-4 h-3 bg-gray-300 rounded-md border"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">4-seater:</span>
              <div className="w-4 h-4 bg-gray-300 rounded-full border"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">5-seater:</span>
              <div className="w-5 h-3 bg-gray-300 rounded-full border"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">6-seater:</span>
              <div className="w-5 h-4 bg-gray-300 rounded-2xl border"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Form */}
      <div className="w-[28%] bg-black/80 backdrop-blur-md p-8 shadow-2xl rounded-2xl border border-gray-700">       
        <h2 className="text-3xl font-bold mb-6 text-white text-center">
          {isUpdateMode ? "Update Reservation" : "Reserve Tables"}
        </h2>
        
        {isUpdateMode && updateData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/30">
            <p className="text-blue-200 text-sm mb-1">Updating reservation for:</p>
            <p className="text-white font-bold">{updateData.date} at {updateData.time}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-600 rounded-lg bg-black/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              name="phone"
              placeholder="Phone Number (10 digits)"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-600 rounded-lg bg-black/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-600 rounded-lg bg-black/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block font-medium mb-2 text-white">Number of Guests:</label>
            <select
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
              className="w-full p-4 border border-gray-600 rounded-lg bg-black/70 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            >
              {[...Array(20).keys()].map((num) => (
                <option key={num + 1} value={num + 1}>
                  {num + 1} {num + 1 === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          {selectedTables.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-lg border border-yellow-500/30">
              <h4 className="text-yellow-200 font-medium mb-3 text-center">Selected Tables</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedTables.map((tableNum) => {
                  const table = tables.find(t => String(t.tableNumber) === tableNum);
                  return (
                    <span key={tableNum} className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      Table {tableNum} ({table?.capacity || '?'}p)
                    </span>
                  );
                })}
              </div>
              <p className="text-yellow-200 text-xs text-center mt-2">
                Total capacity: {selectedTables.reduce((sum, tableNum) => {
                  const table = tables.find(t => String(t.tableNumber) === tableNum);
                  return sum + (table?.capacity || 0);
                }, 0)} guests
              </p>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
              className="mt-1 w-4 h-4 text-yellow-500 focus:ring-yellow-500 bg-black/70 border-gray-600 rounded"
            />
            <label className="text-white text-sm leading-relaxed">
              I agree to the <span className="text-yellow-400 underline">terms and conditions</span> and confirm that the reservation details are accurate.
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-black p-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {isUpdateMode ? "✅ Update Reservation" : "🎉 Reserve Selected Tables"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TableSelection;