const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const cors = require('cors')




// @desc    Register user
// @access  Public
router.post('/send-otp',userController.sendOTP)
router.post('/login',userController.userLogin)
router.post('/verify-otp',userController.verifyOTP)




module.exports=router
