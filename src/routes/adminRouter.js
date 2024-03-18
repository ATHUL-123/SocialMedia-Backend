const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const {protect} = require('../middleware/adminAuthMiddleware')





// @desc    Register user
// @access  Public
router.post('/login',adminController.adminLogin)
router.get('/getallusers',protect,adminController.getAllUsers)
router.patch('/toggle-userblock/:userId',adminController.userStatusToggle)



module.exports=router
