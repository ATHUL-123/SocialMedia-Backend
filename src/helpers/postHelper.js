const Post = require('../models/postModel');
const Connection = require('../models/connectionModel');
const User = require('../models/userModel')
const Report = require('../models/reportsModel')
const Comment = require('../models/commentModel')



// @desc    Add New Post
// @route   POST /posts/addpost
// @access  Private
const addPost = async ({ imageUrl, description, userId }) => {
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
const deletePost = (postId) => {
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
const updatePost = async (postId, data) => {
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


const getPostByUserId = async (userId) => {
    return new Promise(async (resolve, reject) => {
        try {

            // Find user by ID
            const user = await User.findById(userId);
            if (!user) {
                reject({
                    error_code: 'USER_NOT_FOUND',
                    message: 'User not found',
                    status: 404,
                });
                return;
            }


            // Find posts by user ID and populate user details
            const posts = await Post.find({ userId: userId }).populate('userId');
            console.log(posts);
            resolve(posts);
        } catch (error) {
            console.error(error);
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};





const checkIfPostIsLiked = (post, userId) => {
    const { Types } = require('mongoose'); // Import Types from mongoose
    // Convert userId to ObjectId using Types.ObjectId
    const userIdObject = new Types.ObjectId(userId);
   
    // Assuming post.likes is an array of user IDs who liked the post 
    return post.likes.some(likeId => likeId.equals(userIdObject)); // Check if any likeId equals userIdObject
};




const getAllFolloweesPost = async (userId, page = 1, pageSize = 10) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Step 1: Find the user's connections
            const userConnection = await Connection.findOne({ userId: userId });

            if (!userConnection) {
                resolve([]); // No connections found, return an empty array
                return;
            }

            // Step 2: Retrieve posts of each followee
            const followees = userConnection.following;
            const followeesPosts = [];

            for (const followeeId of followees) {
                const posts = await Post.find({ userId: followeeId,blocked:false})
                .populate('userId')
                .populate('likes')
                for (const post of posts) {
                    const isLiked = checkIfPostIsLiked(post, userId); // Add the isLiked field based on some condition
                    const postObject = post.toObject(); // Convert Mongoose document to plain JavaScript object
                    postObject.isLiked = isLiked;
                    followeesPosts.push(postObject); // Push the modified post object into followeesPosts
                }
            }
            

            // Now followeesPosts contains all posts with the isLiked field added


            // Step 3: Sort posts by updatedAt time
            followeesPosts.sort((a, b) => b.updatedAt - a.updatedAt);

            // Step 4: Apply pagination
            const startIndex = (page - 1) * pageSize;
            const endIndex = page * pageSize;
            const paginatedPosts = followeesPosts.slice(startIndex, endIndex);

            resolve(paginatedPosts);
        } catch (error) {
            console.log(error);
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};

const likePost = async (userId, postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const post = await Post.findById(postId);
            if (!post) {
                reject({
                    error_code: 'NOT_FOUND',
                    message: 'Post not found',
                    status: 404,
                });
                return;
            }
            // Check if the user has already liked the post
            if (post.likes.includes(userId)) {
                resolve({
                    message: 'User already liked the post',
                    status: 200,
                });
                return;
            }
            // Update the likes array
            post.likes.push(userId);
            await post.save();
            resolve({
                message: 'Post liked successfully',
                status: 200,
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


const unLikePost = async (userId, postId) => {
    return new Promise(async (resolve, reject) => {
        try {
           
            const post = await Post.findById(postId);
            if (!post) {
                reject({
                    error_code: 'NOT_FOUND',
                    message: 'Post not found',
                    status: 404,
                });
                return;
            }
            
            // Check if the user has already liked the post
            const likedIndex = post.likes.indexOf(userId);
            if (likedIndex === -1) {
                resolve({
                    message: 'User has not liked the post',
                    status: 200,
                });
                return;
            }
            
            // Remove the user's like from the likes array
            post.likes.splice(likedIndex, 1);
            await post.save();
            
            resolve({
                message: 'Post unliked successfully',
                status: 200,
            });
        } catch (error) {
            console.log(error);
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};

const reportPost = async ({ reporterId, reporterUsername, reportType, targetId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(targetId);
            // Check if the post exists
            const post = await Post.findById(targetId);
            if (!post) {
                reject({
                    error_code: 'NOT_FOUND',
                    message: 'Post not found',
                    status: 404,
                });
                return;
            }

            // Count the number of reports for the given targetId
            const reportCount = await Report.countDocuments({ targetId: targetId });

            // Create a new report object
            const newReport = new Report({
                reporterId,
                reporterUsername,
                reportType,
                targetId,
            });

            // Save the report
            await newReport.save();

            // Check if the report count exceeds 9
            if (reportCount + 1 > 4) { // Adding 1 for the newly added report
                post.blocked = true;
                // Save the updated post
                 await post.save();
            
                resolve({
                    message: 'Post reported successfully and blocked due to excessive reports',
                    status: 200,
                });
            } else {
                resolve({
                    message: 'Post reported successfully',
                    status: 200,
                });
            }
        } catch (error) {
            console.log(error);
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};




const addComment = async ({userId,userName,postId,content}) => {
    return new Promise(async (resolve, reject) => {
        try {
          
            // Check if the post exists
            const post = await Post.findById(postId);
            if (!post) {
                reject({
                    error_code: 'NOT_FOUND',
                    message: 'Post not found',
                    status: 404,
                });
                return;
            }

            // Create a new report object
            const newComment = new Comment({
                userId,
                userName,
                postId,
                content,
            });

            // Save the report
            await newComment.save();

            resolve({
                message: 'Comment added successfully',
                status: 200,
            });
        } catch (error) {
            console.log(error);
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};

const replyComment = async ( parentId,{ userId, userName, postId, content }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Check if the parent comment exists
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                reject({
                    error_code: 'NOT_FOUND',
                    message: 'Parent comment not found',
                    status: 404,
                });
                return;
            }

            // Check if the post exists
            const post = await Post.findById(postId);
            if (!post) {
                reject({
                    error_code: 'NOT_FOUND',
                    message: 'Post not found',
                    status: 404,
                });
                return;
            }

            // Create a new reply comment object
            const newReply = new Comment({
                userId,
                userName,
                postId,
                content,
                parentId,
            });

            // Save the reply comment
            await newReply.save();

            resolve({
                message: 'Reply added successfully',
                status: 200,
            });
        } catch (error) {
            console.log(error);
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};

const fetchReplies = (parentId) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Find all comments with the given parent ID
        const replies = await Comment.find({ parentId }).populate('userId')
  
        // Return the fetched replies
        resolve({
          replies,
          message: 'Replies fetched successfully',
          status: 200,
        });
      } catch (error) {
        console.error(error);
        reject({
          error_code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong while fetching replies',
          status: 500,
        });
      }
    });
  };
  
  const getAllComments = (postId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Find all comments with the given postId and no parentId
            const comments = await Comment.find({ postId, parentId: { $exists: false } }).populate('userId');

            // Get the count of replies for each top-level comment
            const commentsWithRepliesCount = await Promise.all(comments.map(async (comment) => {
                const repliesCount = await Comment.countDocuments({ parentId: comment._id });
                return { ...comment.toObject(), repliesCount };
            }));

            // Resolve with top-level comments and their replies count
            resolve({
                comments: commentsWithRepliesCount,
                message: 'Top-level comments retrieved successfully',
                status: 200,
            });
        } catch (error) {
            console.log(error);
            // Reject with error
            reject({
                error_code: 'INTERNAL_SERVER_ERROR',
                message: 'Something went wrong on the server',
                status: 500,
            });
        }
    });
};



const deleteComment = (commentId) => {
    return new Promise((resolve, reject) => {
        Comment.findByIdAndDelete(commentId)
            .then((deletedComment) => {
                if (deletedComment) {
                    return Comment.deleteMany({ parentId: deletedComment._id });
                } else {
                    reject({
                        error_code: 'NOT_FOUND',
                        message: 'Comment not found',
                        status: 404,
                    });
                }
            })
            .then(() => {
                resolve({
                    message: 'Comment deleted successfully',
                    status: 200,
                });
            })
            .catch((error) => {
                console.error(error);
                reject({
                    error_code: 'INTERNAL_SERVER_ERROR',
                    message: 'Something went wrong on the server',
                    status: 500,
                });
            });
    });
};




module.exports = {
    addPost,
    getAllPosts,
    deletePost,
    updatePost,
    getPostByUserId,
    getAllFolloweesPost,
    likePost,
    unLikePost,
    reportPost,
    addComment,
    getAllComments,
    deleteComment,
    replyComment,
    fetchReplies
}