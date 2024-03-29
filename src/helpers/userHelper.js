const bcrypt = require('bcryptjs')
const saltRounds = 10; //setting salt rounds
const User = require('../models/userModel');

const sendEmail = require('../services/nodeMailer')
const generateToken = require('../services/jwt');
const Verify = require('../models/verifyModel')
const verifyOtp = require('../services/emailVerification')
const Connection = require('../models/connectionModel')
const Razorpay = require("razorpay");
require("dotenv").config();




// @desc    Sent verification link
// @route   GET /auth/sent-verification
// @access  Public - users
const sendVerifyEmail = (data) => {
  return new Promise((resolve, reject) => {
    try {
      User.findOne({ email: data.email })
        .then(async (user) => {
          if (user) {
            reject({
              status: 401,
              message: "You already have an account.",
            });
          } else {
            const verify = await Verify.findOne({ email: data.email });
            if (verify && verify.updatedAt && (Date.now() - verify.updatedAt.getTime()) < 60000) {
              reject({
                status: 401,
                message: "OTP already sent within the last one minute",
              });
            } else {
              // If everything is fine, proceed with sending the email
              const response = await sendEmail(data);
              resolve(response);
            }
          }
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject({
        status: 500,
        error_code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong please try after sometime.",
      });
    }
  });
};



// @desc    Verify email
// @route   GET /auth/verify-otpToken
// @access  Public - Registerd users
const verifyEmailOtp = (email, token) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('here');
      verifyOtp(email,token)
        .then(async (response) => {
          User.findOne({ email: email })
            .then((user) => {
              console.log('inside');
              resolve(user);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject({
        status: 500,
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong please try after sometime.',
      });
    }
  });
};

const loginWithGoogle = async (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if the user exists with the provided email
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        reject({
          status: 404,
          error_code: 'USER_NOT_FOUND',
          message: 'User not found with the provided email',
        });
        return;
      }

      if (existingUser.blocked) {
        reject({
          status: 401,
          error_code: 'USER_IS_BLocked',
          message: 'Your Account is Blocked'
        })
      }


      const user = {
        _id: existingUser._id,
        userName: existingUser.userName,
        email: existingUser.email,
        token: generateToken(existingUser._id, existingUser.role),
        profilePic: existingUser.profilePic,
        online: existingUser.online,
        phone: existingUser.phone,
        bio: existingUser.bio,
        name: existingUser.name,
        blocked: existingUser.blocked,
        verified: existingUser.verified,
        role: existingUser.role
      }

      // If user and password match, resolve with the user data
      resolve({
        status: 200,
        message: 'Login successful',
        user: user

      });
    } catch (error) {
      reject({
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on the server',
        status: 500,
      });
    }
  });
}

// @desc    Authenticate user
// @route   POST /users/login
// @access  Public
const login = async (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if the user exists with the provided email
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        reject({
          status: 404,
          error_code: 'USER_NOT_FOUND',
          message: 'User not found with the provided email',
        });
        return;
      }

      if (existingUser.blocked) {
        reject({
          status: 401,
          error_code: 'USER_IS_BLocked',
          message: 'Your Account is Blocked'
        })
      }

      // Check if the provided password matches the user's hashed password
      const passwordMatch = await bcrypt.compare(password, existingUser.password);
      if (!passwordMatch) {
        reject({
          status: 401,
          error_code: 'INVALID_PASSWORD',
          message: 'Invalid password',
        });
        return;
      }

      const user = {
        _id: existingUser._id,
        userName: existingUser.userName,
        email: existingUser.email,
        token: generateToken(existingUser._id, existingUser.role),
        profilePic: existingUser.profilePic,
        online: existingUser.online,
        phone: existingUser.phone,
        bio: existingUser.bio,
        name: existingUser.name,
        blocked: existingUser.blocked,
        verified: existingUser.verified,
        role: existingUser.role
      }

      // If user and password match, resolve with the user data
      resolve({
        status: 200,
        message: 'Login successful',
        user: user

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


const editProfileDetails = async (data, userId) => {
  return new Promise(async (resolve, reject) => {

    try {

      const user = await User.findById(userId)

      if (!user) {
        reject({
          error_code: 'DB_FETCH_ERROR',
          message: 'User not found',
          status: 401,
        });
      }

      user.name = data.name;
      user.profilePic = data.image;
      user.bio = data.bio;
      console.log('asdfghjkl');
      console.log(data.image);
      user.save()
        .then((updatedUser) => {

          const user = {
            _id: updatedUser._id,
            userName: updatedUser.userName,
            email: updatedUser.email,
            token: generateToken(updatedUser._id),
            profilePic: updatedUser.profilePic,
            online: updatedUser.online,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            name: updatedUser.name,
            blocked: updatedUser.blocked,
            verified: updatedUser.verified
          }

          resolve({
            status: 200,
            message: 'user updated successfully',
            updatedUser: user,
          });
        })
        .catch((error) => {
          console.log(error);
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
  })
}


const mongoose = require('mongoose');
const fetchUsersHelp = async (userId, page, limit,searchQuery ='') => {
  return new Promise(async (resolve, reject) => {
    try {
      const connection = await Connection.findOne({ userId: userId });
      let followingIds = [];
      if (connection && connection.following) {
        followingIds = connection.following;
      }

      // Convert userId to ObjectId if it's a string
      if (typeof userId === 'string') {
        userId = new mongoose.Types.ObjectId(userId);
      }
      
      let totalCount ;
      let users;
      if(searchQuery){
         totalCount = await User.countDocuments({ _id: { $nin: [...followingIds, userId] }, role: { $ne: 'Admin' },userName:{$regex:searchQuery,$options:'i'} });
         users = await User.find({ _id: { $nin: [...followingIds, userId] }, role: { $ne: 'Admin' },userName:{$regex:searchQuery,$options:'i'} })
          .skip((page - 1) * limit)
          .limit(limit);
      }else{
         totalCount = await User.countDocuments({ _id: { $nin: [...followingIds, userId] }, role: { $ne: 'Admin' } });
         users = await User.find({ _id: { $nin: [...followingIds, userId] }, role: { $ne: 'Admin' } })
          .skip((page - 1) * limit)
          .limit(limit);
      }



      resolve({
        data: users,
        page,
        total: totalCount
      });
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
  




// @desc    To check valid user
// @access  Private
const isValidUserId = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    return !!user;
  } catch (error) {
    console.error("Error in isValidUserId:", error);
    return false;
  }
}

const addRequest = async (userId, followeeId) => {
  try {
    const user = await User.findById(followeeId);
    if (user.isPrivate) {
      const userConnection = await Connection.findOneAndUpdate(
        { userId: followeeId },
        { $addToSet: { requested: userId } },
        { upsert: true, new: true }
      );
      return false; // Indicate that request is added
    }
    return true; // No request needed for public user
  } catch (error) {
    console.error("Error in addRequest:", error);
    return false;
  }
}

const followHelper = async (userId, followeeId) => {
  try {
    // Validate user IDs
    const userIdValid = await isValidUserId(userId);
    const followeeIdValid = await isValidUserId(followeeId);
    
    if (!userIdValid || !followeeIdValid) {
      throw new Error("Invalid user ID");
    }

    // Check if a follow request is required
    const requestAdded = await addRequest(userId, followeeId);
    if (!requestAdded) {
      return "Follow request sent to private user";
    }

    // Update following and followers lists
    const userConnection = await Connection.findOneAndUpdate(
      { userId: userId },
      { $addToSet: { following: followeeId } },
      { upsert: true, new: true }
    );

    const followeeConnection = await Connection.findOneAndUpdate(
      { userId: followeeId },
      { $addToSet: { followers: userId } },
      { upsert: true, new: true }
    );

    return { userConnection, followeeConnection };
  } catch (error) {
    console.error("Error in followHelper:", error.message);
    throw error; // Propagate the error
  }
}



// @desc    UnFollow user
// @route   POST /user/unfollow/:unfolloweeUserId
// @access  Registerd users
const unFollowHelper = (userId, followeeId) => {
  return new Promise((resolve, reject) => {
    try {
      //Checking userIDs
      if (!isValidUserId(userId) && !isValidUserId(followeeId)) {
        reject(new Error("Invalid user ID"));
        return;
      }
     
      Connection.findOneAndUpdate(
        { userId: userId },
        { $pull: { following: followeeId } },
        { new: true }
      ).exec()
        .then((userConnection) => {
          Connection.findOneAndUpdate(
            { userId: followeeId },
            { $pull: { followers: userId } },
            { new: true }
          ).exec()
            .then((followeeConnection) => {

              resolve({ userConnection, followeeConnection });

            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      console.log(error.message);
      reject(error)
    }
  })
}


const getFollowing = (userId, page, limit) => {
  return new Promise((resolve, reject) => {
    try {
      Connection.findOne({ userId: userId })
        .populate('following')
        .then(async (userConnection) => {
          if (!userConnection) {
            throw new Error('User connection not found');
          }
          const following = userConnection.following;
          const totalCount = following.length;
          
          // If pagination is applied, adjust totalCount
          if (page && limit) {
            const startIndex = (page - 1) * limit;
            const endIndex = Math.min(startIndex + limit, totalCount);
            resolve({ following: following.slice(startIndex, endIndex), totalCount });
          } else {
            resolve({ following, totalCount });
          }
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};

const getFollowers = (userId, page, limit) => {
  return new Promise((resolve, reject) => {
    try {
      Connection.findOne({ userId: userId })
        .populate('followers')
        .then(async (userConnection) => {
          if (!userConnection) {
            throw new Error('User connection not found');
          }
          const followers = userConnection.followers;
          const totalCount = followers.length;
          
          // If pagination is applied, adjust totalCount
          if (page && limit) {
            const startIndex = (page - 1) * limit;
            const endIndex = Math.min(startIndex + limit, totalCount);
            resolve({ followers: followers.slice(startIndex, endIndex), totalCount });
          } else {
            resolve({ followers, totalCount });
          }
        })
        .catch((error) => {
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};


const getUserById = (userId, ownId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Fetching user...');
      
      // Fetch the user by userId
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
   
      const userConnection = await Connection.findOne({userId:ownId});
      
 
     
      let access = !user.isPrivate;
      let following=false;
      
      if (userConnection && userConnection.following.includes(userId)) {
        access = true;
       following=true;
      }

      const OtherUserConnection = await Connection.findOne({userId:userId});
      if (OtherUserConnection && OtherUserConnection.requested.includes(ownId)){
        following='requested'
      }

      
    
      const userData = {
        userName: user.userName,
        name: user.name,
        _id: user._id,
        email: user.email,
        bio: user.bio,
        isPrivate: user.isPrivate,
        profilePic: user.profilePic,
        phone: user.phone,
        online: user.online,
        access: access,
        following:following
      };
      
      resolve(userData);
    } catch (error) {
      console.error('Error in getUserById:', error);
      reject(error);
    }
  });
};




const togglePrivacy = async (userId) => {
  try {
    // Assuming you have a User model
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Toggle the value of isPrivate
    user.isPrivate = !user.isPrivate 

    // Save the updated user object
    await user.save();

    const data = {
      userName: user.userName,
      name: user.name,
      _id: user._id,
      email: user.email,
      bio: user.bio,
      isPrivate: user.isPrivate,
      profilePic: user.profilePic,
      phone: user.phone,
      online: user.online
    };

    return data;
  } catch (error) {
    return { success: false, message: error.message };
  }
};


const getRequested = async (userId) => {
  return new Promise(async (resolve, reject) => {
      try {
          // Step 1: Find the user's connections
          const userConnection = await Connection.findOne({ userId: userId }).populate('requested')

          if (!userConnection) {
              resolve([]); // No connections found, return an empty array
              return;
          }
           
          if(userConnection.requested){
            resolve(userConnection.requested);
          }else{
            reject({message:"No Requests"})
          }
          
      } catch (error) {
          reject({
              error_code: 'INTERNAL_SERVER_ERROR',
              message: 'Something went wrong on the server',
              status: 500,
          });
      }
  });
}

const acceptRequest = async (userId, requestId) => {
  return new Promise(async (resolve, reject) => {
      try {
        console.log(userId,requestId);
        console.log('insisnsinsinsin');
          // Step 1: Find the user's connections
          const userConnection = await Connection.findOne({ userId: userId })

          if (!userConnection) {
              reject({ message: "User connection not found" });
              return;
          }

          // Step 2: Check if there are any requests
          if (!userConnection.requested || userConnection.requested.length === 0) {
            reject({ message: "No pending requests found" });
            return;
          }

          // Step 3: Remove requestId from requested array and add it to followers and following arrays
         const user = await Connection.findOneAndUpdate(
            { userId: userId },
            { 
              $pull: { requested: requestId },
              $addToSet: { followers: requestId }
            },
            { upsert: true, new: true }
          );

          await Connection.findOneAndUpdate(
            { userId: requestId },
            { $addToSet: { following: userId } },
            { upsert: true, new: true }
          );
    console.log(user);
          resolve("Request accepted successfully");
          
      } catch (error) {
          console.error("Error in acceptRequest:", error);
          reject({
              error_code: 'INTERNAL_SERVER_ERROR',
              message: 'Something went wrong on the server',
              status: 500,
          });
      }
  });
}


const rejectRequest = async (userId, requestId) => {
  return new Promise(async (resolve, reject) => {
      try {
          // Step 1: Find the user's connections
          const userConnection = await Connection.findOne({ userId: userId });

          if (!userConnection) {
              reject({ message: "User connection not found" });
              return;
          }

          // Step 2: Check if there are any requests
          if (!userConnection.requested || userConnection.requested.length === 0) {
              reject({ message: "No pending requests found" });
              return;
          }

          // Step 3: Remove requestId from requested array
          const updatedUser = await Connection.findOneAndUpdate(
              { userId: userId },
              { $pull: { requested: requestId } },
              { new: true }
          );

     

          resolve("Request rejected successfully");
      } catch (error) {
          console.error("Error in rejectRequest:", error);
          reject({
              error_code: 'INTERNAL_SERVER_ERROR',
              message: 'Something went wrong on the server',
              status: 500,
          });
      }
  });
}


const createPayment = () => {
  return new Promise(async (resolve, reject) => {
      try {
  
          const instance = new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_SECRET,
          });
            
          const options = {
              amount: 1200 * 100, // amount in smallest currency unit
              currency: "INR",
              receipt: "receipt_order_74394",
          };

          const order = await instance.orders.create(options);

          if (!order) {
              reject("Some error occurred while creating the order");
              return;
          }

          resolve(order);
      } catch (error) {
          console.error("Error in createPayment:", error);
          reject(error);
      }
  });
};

const successPayment = (userId) => {
  return new Promise(async (resolve, reject) => {
      try {
         
          const updatedUser = await User.findByIdAndUpdate(userId, { verified: true });

        
          if (!updatedUser) {
              throw new Error("Failed to update user's verified status");
          }
 
          console.log('successs');
          resolve(updatedUser);
      } catch (error) {
          console.error("Error in successPayment:", error);
          reject(error);
      }
  });
};



module.exports = {
  sendVerifyEmail,
  login,
  verifyEmailOtp,
  editProfileDetails,
  loginWithGoogle,
  fetchUsersHelp,
  followHelper,
  unFollowHelper,
  getFollowing,
  getUserById,
  togglePrivacy,
  getFollowers,
  getRequested,
  acceptRequest,
  rejectRequest,
  createPayment,
  successPayment
}



