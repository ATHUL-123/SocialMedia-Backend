const bcrypt = require('bcryptjs')
const saltRounds = 10; //setting salt rounds
const generateJwt = require('../services/jwt')
const User = require('../models/userModel')

// @desc    Login admin
// @route   POST /admin/login
// @access  Public
const adminLogin = async (email, password) => {
    try {
        // Find admin by email
        const admin = await User.findOne({ email:email });
        // Check if admin exists and verify password
        const passwordMatch=await bcrypt.compare(password, admin.password)
        if (admin && passwordMatch && admin.role ==='Admin') {
            const token = await generateJwt(admin._id,admin.role);
            const data = {
                _id:admin._id,
                email:admin.email,
                name:admin.userName,
                token:token,
                role:admin.role
            }
            return {
                status: 200,
                message: "Admin login successful",
                token,
                admin:data,
                valid: true
            };
        } else {
            throw { status: 401, message: "Invalid credentials" };
        }
    } catch (error) {
        console.error("Error during admin login: ", error);
        throw { status: 500, message: error.message };
    }
};


const block_Unblock_User = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw { status: 404, message: "User not found." };
        }
        
        user.blocked = !user.blocked;
        
        const newUser=await user.save();

        return {
            status: 200,
            message: "User Status Updated Successfull",
            newStatus:newUser.blocked
        };
    } catch (error) {
        let status = error.status || 500;
        let message = error.message || "Internal Server Error.";
        throw { status, message };
    }
}

  
  module.exports = {
    adminLogin,
    block_Unblock_User
  };
  