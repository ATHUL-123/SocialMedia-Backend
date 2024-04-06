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

router.patch('/like-post/:postId',authMiddleware.protect,postController.likePost)

router.patch('/unlike-post/:postId',authMiddleware.protect,postController.unLikePost)

router.post('/report-post/:postId',authMiddleware.protect,postController.reportPost)

router.post('/add-comment/:postId',authMiddleware.protect,postController.addComment)

router.get('/fetch-comments/:postId',authMiddleware.protect,postController.getAllComments)

router.delete('/delete-comment/:commentId',authMiddleware.protect,postController.deleteComment)

router.put('/comments/reply-to/:commentId',authMiddleware.protect,postController.replyComment)

router.get('/fetch-replies/:commentId',postController.fetchReplies)

router.get('/search-post',postController.searchPost)

router.get('/explore-posts',postController.explorePost)

router.get('/commentCount/:postId',postController.getCommentCount)

router.post('/savePost/:postId',authMiddleware.protect,postController.savePost)

router.get('/savePost',authMiddleware.protect,postController.fetchSavedPost)

router.delete('/savePost/:savedId',authMiddleware.protect,postController.removeSavedPost)


module.exports=router