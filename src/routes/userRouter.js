const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const cors = require('cors')
const {protect} = require('../middleware/authMiddleware')




// @desc    Register user
// @access  Public
router.post('/send-otp',userController.sendOTP)
router.post('/login',userController.userLogin)
router.post('/verify-otp',userController.verifyOTP)
router.put('/edit-profile',protect,userController.editProfile)
router.post('/google-login',userController.googleLogin)
router.get('/fetch-users',protect,userController.fetchUsers)
// @desc    Follow user
// @access  Registerd users
router.post("/follow/:followeeId", protect,userController.followUser)

router.put("/unfollow/:unfolloweeId", protect,userController.unFollowUser)

router.get('/fetch-following',protect,userController.getFollowing)

router.get('/fetch-followers',protect,userController.getFollowers)

router.get('/get-single-user/:userId',protect,userController.getUser)

router.patch('/toggleprivacy',protect,userController.togglePrivacy)
module.exports=router
