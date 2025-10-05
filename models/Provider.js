const mongoose = require('mongoose');
const weeklyMenuSchema = new mongoose.Schema({
  monday: { text: String, image: String },
  tuesday: { text: String, image: String },
  wednesday: { text: String, image: String },
  thursday: { text: String, image: String },
  friday: { text: String, image: String },
  saturday: { text: String, image: String },
  sunday: { text: String, image: String }
}, { _id: false });
const providerSchema = new mongoose.Schema({
  ownerEmail: { type: String, required: true, lowercase: true },
  name: String,
  location: String,
  foodType: String,
  perTiffinPrice: Number,
  monthlyPrice: Number,
  menu: String,
  openTime: String,
  contactNumber: String,
  weeklyMenu: weeklyMenuSchema,
  images: [String]
}, { timestamps: true });
module.exports = mongoose.model('Provider', providerSchema);
