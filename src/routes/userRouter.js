const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const cors = require('cors')
const { protect } = require('../middleware/authMiddleware')





//flutter...
router.get('/getuser',protect,userController.loginnedUser)

router.post('/send-otp',userController.sendOTP)
router.post('/login',userController.userLogin)
router.post('/verify-otp',userController.verifyOTP)
router.put('/edit-profile',protect,userController.editProfile)
router.post('/google-login',userController.googleLogin)
router.get('/fetch-users',protect,userController.fetchUsers)
// @desc    Follow user
// @access  Registerd users
router.post("/follow/:followeeId", protect,userController.followUser)
// >>>>>>> 9b9590f75b470d47ac41c6301e4d608776ebab8e

router.put("/unfollow/:unfolloweeId", protect,userController.unFollowUser)


router.get('/fetch-following',protect,userController.getFollowing)

router.get('/fetch-followers',protect,userController.getFollowers)

router.get('/get-single-user/:userId',protect,userController.getUser)

router.patch('/toggleprivacy',protect,userController.togglePrivacy)

router.get('/get-request',protect,userController.getAllRequest)

router.put('/accept-request/:requestId',protect,userController.acceptRequest)

router.put('/reject-request/:requestId',protect,userController.rejectRequest)


router.post('/payment/create',protect,userController.createPayment)

router.post('/payment/success',protect,userController.userVerification)

module.exports=router
// >>>>>>> 9b9590f75b470d47ac41c6301e4d608776ebab8e
