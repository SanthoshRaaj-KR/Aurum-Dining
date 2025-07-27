// Backend/takeaway-service/src/models/takeawayOrder.js
import mongoose from "mongoose";

const takeawayOrderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  fullName: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String, 
    required: true 
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  billing: {
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    acTax: { type: Number, required: true, min: 0 },
    gst: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'online', 'card'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  estimatedDeliveryTime: {
    type: Date,
    default: function() {
      // Default to 45 minutes from now
      return new Date(Date.now() + 45 * 60 * 1000);
    }
  },
  actualDeliveryTime: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ""
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
takeawayOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add index for faster queries by userId and status
takeawayOrderSchema.index({ userId: 1, status: 1 });
takeawayOrderSchema.index({ createdAt: -1 });

export default mongoose.model("TakeawayOrder", takeawayOrderSchema);