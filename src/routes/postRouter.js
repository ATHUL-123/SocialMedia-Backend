const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const authMiddleware = require('../middleware/authMiddleware')




// @desc    Add user post
// @access  Private
router.post('/addPost',authMiddleware.protect,postController.addUserPost)

router.get('/getpost',authMiddleware.protect,postController.getallpost)
router.delete('/delete-post/:postId',authMiddleware.protect,postController.deletePost)
router.put('/update-post/:postId',authMiddleware.protect,postController.editPost)

router.get('/getuserpost/:userId',postController.getPostByUserId)


router.get('/allfollowingsPost',authMiddleware.protect,postController.getAllFolloweesPost)



module.exports=router