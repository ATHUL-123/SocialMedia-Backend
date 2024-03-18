const Admin = require('../models/adminModel')
const generateJwt = require('../services/adminJwt')
const User = require('../models/userModel')

// @desc    Login admin
// @route   POST /admin/login
// @access  Public
const adminLogin = async (email, password) => {
    try {
        // Find admin by email
        const admin = await Admin.findOne({ email:email });

        // Check if admin exists and verify password
        if (admin && admin.password === password) {
            const token = await generateJwt(admin.email);
            const data = {
                _id:admin._id,
                email:admin.email,
                name:admin.email,
                token:token
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
  