const Post =require('../models/postModel');




// @desc    Add New Post
// @route   POST /posts/addpost
// @access  Private
const addPost = async ({ imageUrl, description , userId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Create a new post object
            const newPost = new Post({
                image: imageUrl,
                description: description,
                userId: userId
            });

            // Save the new post to the database
            newPost.save()
                .then((response) => {
                    resolve({
                        status: 201,
                        message: 'Post created successfully',
                    });
                })
                .catch((error) => {
                    reject({
                        error_code: 'DB_SAVE_ERROR',
                        message: 'Something went wrong while saving to the database',
                        status: 500,
                    });
                });
        } catch (error) {
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};


const getAllPosts = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
         
            // Fetch all posts from the database
            const posts = await Post.find({ userId: userId }).populate('userId')
            resolve(posts);
            
        } catch (error) {
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
                error: error.message
            });
        }
    });
};


// @desc    Delete post
//@route    DELETE /post/delete/post/:postId
// @access  Registerd users
const deletePost= (postId) => {
    return new Promise((resolve, reject) => {
      try {
        Post.deleteOne({ _id: postId })
          .then((response) => {
            resolve(response);
            console.log(response);
          })
          .catch((err) => {
            reject({
              status: 500,
              error_code: "DB_FETCH_ERROR",
              message: err.message,
              err,
            });
          });
      } catch (error) {
        reject({
          status: 500,
          error_code: "INTERNAL_SERVER_ERROR",
          message: error.message,
          error,
        });
      }
    });
  };


// @desc    Update Post
// @route   PUT /posts/updatepost/:id
// @access  Private
const updatePost = async (postId,data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Find the post by ID
            const post = await Post.findById(postId);

            // Check if the post exists
            if (!post) {
                return reject({
                    error_code: 'POST_NOT_FOUND',
                    message: 'Post not found',
                    status: 404,
                });
            }

            // Update the post fields
            post.image = data.imageUrl;
            post.description = data.description;

            // Save the updated post to the database
            post.save()
                .then((updatedPost) => {
                    resolve({
                        status: 200,
                        message: 'Post updated successfully',
                        updatedPost: updatedPost,
                    });
                })
                .catch((error) => {
                    reject({
                        error_code: 'DB_UPDATE_ERROR',
                        message: 'Something went wrong while updating the post',
                        status: 500,
                    });
                });
        } catch (error) {
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};


module.exports ={
    addPost,
    getAllPosts,
    deletePost,
    updatePost
}