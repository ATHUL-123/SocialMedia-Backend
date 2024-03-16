const express = require('express')
const router = express.Router()
const postController = require('../controllers/postController')
const authMiddleware = require('../middleware/authMiddleware')




// @desc    Add user post
// @access  Private
router.post('/addPost',postController.addUserPost)

router.get('/getpost',authMiddleware.protect,postController.getallpost)
router.delete('/delete-post/:postId',postController.deletePost)
router.put('/update-post/:postId',postController.editPost)




module.exports=router