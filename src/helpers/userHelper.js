const bcrypt = require('bcryptjs')
const saltRounds = 10; //setting salt rounds
const User =require('../models/userModel');
const { response } = require('express');
const  sendEmail = require('../services/nodeMailer')
const generateToken = require('../services/jwt');
const Verify = require('../models/verifyModel')
const verifyOtp = require('../services/emailVerification')





// @desc    Sent verification link
// @route   GET /auth/sent-verification
// @access  Public - users
 const sendVerifyEmail = (data) => {
    return new Promise((resolve, reject) => {
      try {
        User.findOne({ email: data.email })
          .then((user) => {
            if (user) {
                  reject({
                    status: 401,
                    message: "You have already an account.",
                  });
            } else {
              
                sendEmail(data)
                .then((verify) => {
                  resolve(verify);
                })
                .catch((error) => {
                  reject(error);
                });
            }
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject({
          status: 500,
          error_code: "INTERNAL_SERVER_ERROR",
          message: "Somethings wrong please try after sometime.",
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
        verifyOtp(email, token)
          .then(async (response) => {
            User.findOne({ email: email })
              .then((user) => {
                console.log('inside');
                resolve(user)
              
              })
              .catch((error) => {
                reject(error); // Catch any errors from finding the user
              });
          })
          .catch((error) => {
            reject(error); // Catch any errors from verifying OTP
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
  


// @desc    Authenticate user
// @route   POST /users/login
// @access  Public
const login = async ( email, password ) => {
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

            if(existingUser.blocked){
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

            const user ={
                _id:existingUser._id,
                userName:existingUser.userName,
                email:existingUser.email,
                token:generateToken(existingUser._id),
                profilePic:existingUser.profilePic,
                online:existingUser.online,
                phone:existingUser.phone,
                bio:existingUser.bio,
                name:existingUser.name,
                blocked:existingUser.blocked,
                verified:existingUser.verified
            }

            // If user and password match, resolve with the user data
            resolve({
                status: 200,
                message: 'Login successful',
                user:user
              
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


const editProfileDetails = async (data,userId)=>{
  return new Promise(async (resolve,reject)=>{
       
    try {
      
      const user = await User.findById(userId)

      if(!user){
        reject({
          error_code: 'DB_FETCH_ERROR',
          message: 'User not found',
          status: 401,
      });
      }

      user.name=data.name;
      user.profilePic = data.image;
      user.bio        = data.bio;
      console.log('asdfghjkl');
      console.log(data.image);
     user.save()
      .then((updatedUser) => {

        const user ={
          _id:updatedUser._id,
          userName:updatedUser.userName,
          email:updatedUser.email,
          token:generateToken(updatedUser._id),
          profilePic:updatedUser.profilePic,
          online:updatedUser.online,
          phone:updatedUser.phone,
          bio:updatedUser.bio,
          name:updatedUser.name,
          blocked:updatedUser.blocked,
          verified:updatedUser.verified
      }
         
        resolve({
            status: 200,
            message: 'user updated successfully',
            updatedUser:user,
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


module.exports={
    sendVerifyEmail,
    login,
    verifyEmailOtp,
    editProfileDetails
}