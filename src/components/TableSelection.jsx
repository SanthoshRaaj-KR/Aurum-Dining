import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

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

  // Table component with realistic design
  const TableComponent = ({ table }) => {
    const isSelected = selectedTables.includes(String(table.tableNumber));
    const isReserved = reservedTables.includes(String(table.tableNumber));
    
    let tableColor = "bg-green-500 hover:bg-green-400"; // Available
    let borderColor = "border-green-600";
    let textColor = "text-green-900";
    
    if (isReserved) {
      tableColor = "bg-red-500";
      borderColor = "border-red-600";
      textColor = "text-red-900";
    } else if (isSelected) {
      tableColor = "bg-yellow-500 hover:bg-yellow-400";
      borderColor = "border-yellow-600";
      textColor = "text-yellow-900";
    }

    // Different sizes based on capacity
    const getTableSize = (capacity) => {
      switch (capacity) {
        case 2: return "w-16 h-12";
        case 3: return "w-18 h-14";
        case 4: return "w-20 h-16";
        case 5: return "w-22 h-18";
        case 6: return "w-24 h-20";
        default: return "w-16 h-12";
      }
    };

    // Table shape based on capacity
    const getTableShape = (capacity) => {
      if (capacity <= 2) {
        return "rounded-lg"; // Square for 2-seaters
      } else if (capacity <= 4) {
        return "rounded-full"; // Circle for 3-4 seaters
      } else {
        return "rounded-2xl"; // Oval for 5-6 seaters
      }
    };

    return (
      <div 
        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${(table.position?.x || 100) / 600 * 100}%`,
          top: `${(table.position?.y || 100) / 600 * 100}%`
        }}
      >
        <button
          className={`
            ${getTableSize(table.capacity)} 
            ${tableColor} 
            ${getTableShape(table.capacity)}
            border-2 ${borderColor}
            flex flex-col items-center justify-center
            transition-all duration-200 shadow-lg
            ${!isReserved ? 'hover:scale-105' : 'cursor-not-allowed'}
          `}
          onClick={() => toggleTableSelection(table.tableNumber)}
          disabled={isReserved}
        >
          <span className={`font-bold text-sm ${textColor}`}>
            {table.tableNumber}
          </span>
          <span className={`text-xs ${textColor}`}>
            {table.capacity}p
          </span>
        </button>
        
        {/* Chair indicators */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: table.capacity }, (_, i) => {
            const angle = (i / table.capacity) * 2 * Math.PI;
            const radius = table.capacity <= 2 ? 45 : table.capacity <= 4 ? 50 : 55;
            const chairX = Math.cos(angle) * radius;
            const chairY = Math.sin(angle) * radius;
            
            return (
              <div
                key={i}
                className="absolute w-3 h-3 bg-gray-700 rounded-sm transform -translate-x-1/2 -translate-y-1/2"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex">
      {/* Restaurant Layout */}
      <div className="flex-1 p-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg shadow-2xl h-full relative overflow-hidden">
          {/* Restaurant Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-full h-full bg-gradient-to-br from-orange-200 to-amber-200"></div>
          </div>
          
          {/* Restaurant Elements */}
          <div className="absolute top-8 left-8 right-8 h-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Restaurant Floor Plan</span>
          </div>
          
          {/* Kitchen Area */}
          <div className="absolute top-24 right-8 w-32 h-24 bg-gray-300 rounded-lg border-2 border-gray-400 flex items-center justify-center">
            <span className="text-gray-700 font-semibold text-sm">Kitchen</span>
          </div>
          
          {/* Bar Area */}
          <div className="absolute bottom-8 left-8 w-48 h-16 bg-gradient-to-r from-amber-800 to-orange-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">Bar Counter</span>
          </div>
          
          {/* Entrance */}
          <div className="absolute bottom-8 right-8 w-24 h-16 bg-gradient-to-t from-green-600 to-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Entrance</span>
          </div>
          
          {/* Tables */}
          <div className="absolute inset-8 top-32 bottom-32">
            {tables.map((table) => (
              <TableComponent key={table._id} table={table} />
            ))}
          </div>
          
          {/* Legend */}
          <div className="absolute top-32 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <h3 className="font-bold text-gray-800 mb-2">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-700">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                <span className="text-gray-700">Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span className="text-gray-700">Reserved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details Form */}
      <div className="w-96 bg-black/30 backdrop-blur-md p-8 shadow-lg">       
        <h2 className="text-3xl font-semibold mb-6 text-white">
          {isUpdateMode ? "Update Reservation" : "Customer Details"}
        </h2>
        
        {isUpdateMode && updateData && (
          <div className="mb-4 p-3 bg-gray-800 rounded text-white">
            <p className="text-sm">Updating reservation for:</p>
            <p className="font-semibold">{updateData.date} at {updateData.time}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded bg-black/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded bg-black/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded bg-black/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />

          <div>
            <label className="block font-medium mb-2 text-white">Number of Guests:</label>
            <select
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded bg-black/70 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {[...Array(20).keys()].map((num) => (
                <option key={num + 1} value={num + 1}>
                  {num + 1} {num + 1 === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          {selectedTables.length > 0 && (
            <div className="bg-gray-800/50 p-3 rounded">
              <h4 className="text-white font-medium mb-2">Selected Tables:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTables.map((tableNum) => (
                  <span key={tableNum} className="bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-medium">
                    Table {tableNum}
                  </span>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center text-white text-lg">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
              className="mr-3 w-4 h-4 text-yellow-500 focus:ring-yellow-500"
            />
            I agree to the terms and conditions
          </label>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black p-4 rounded-lg mt-4 text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {isUpdateMode ? "Update Reservation" : "Reserve Tables"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TableSelection;