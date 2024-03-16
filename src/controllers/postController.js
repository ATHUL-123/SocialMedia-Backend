const postHelper = require('../helpers/postHelper')


// @desc    post user post
// @route   POST /user/post/addpost
// @access  Private
const addUserPost =async(req,res)=>{
    try {
        const postData= req.body;
        
   postHelper.addPost(postData)
      .then((response)=>{
        res.status(200).json({...response})
      })
      .catch((err)=>{
        res.status(500).send(err);
      })
    } catch (error) {
        res.status(500).send(error);
    }
}

// @desc      Get all the post
// @desc      GET /user/post/getposts
// @access    Private
const getallpost = async(req,res)=>{
    try {
        const userId= req.user.id;
       
   postHelper.getAllPosts(userId)
      .then((response)=>{
        res.status(200).json(response)
      })
      .catch((err)=>{
        res.status(500).send(err);
      })
    } catch (error) {
        res.status(500).send(error);
    }
}


// @desc    Delete post
//@route    DELETE /post/delete/post/:postId
// @access  Registerd users
 const deletePost = (req, res) => {
  try {
    const { postId } = req.params;
    postHelper.deletePost(postId)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  } catch (error) {
    res.status(500).send(error);
  }
};

// @desc    Delete post
//@route    DELETE /post/delete/post/:postId
// @access  Registerd users
const editPost = (req, res) => {
  try {
    const { postId } = req.params;
    const data = req.body;

    postHelper.updatePost(postId,data)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
  
  } catch (error) {
    res.status(500).send(error);
  }
};




module.exports={
    addUserPost,
    getallpost,
    deletePost,
    editPost
}