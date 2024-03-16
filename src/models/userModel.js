const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 30,
    set: function (value) {
      return value.toLowerCase();
    },
  },

  email: {
    type: String,
    required: true,
    trim: true,
    match: emailRegex,
    set: function (value) {
      return value.toLowerCase();
    }
  },

  password: {
    type: String,
  },

  profilePic: {
    type: String,
    trim: true,
    default: "https://res.cloudinary.com/di9yf5j0d/image/upload/v1695795823/om0qyogv6dejgjseakej.png",
  },

  phone: {
    type: String,
    trim: true,
    minlength: 10
  },

  bio: {
    type: String,
    trim: true,
    maxlength: 200
  },
  online: {
    type: Boolean,
    default: false,
  },

  blocked: {
    type: Boolean,
    default: false,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  fcmToken: {
    type: String,
  }
},{
  timestamps: true
});


module.exports = model('user', userSchema);
