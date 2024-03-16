const userHelper = require('../helpers/userHelper')
const asyncHandler = require('express-async-handler')



const userLogin = async(req,res)=>{
  try {
    console.log('haaai');
  
  const {email,password} = req.body
  console.log(email,password);
  userHelper.login(email,password)
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


// @desc    verify  user  using OTP
// @route   GET /user/otp
// @access  Public
const sendOTP = async (req, res) => {
  try {
    console.log('inside the sendOtp');
    console.log(req.body);

    userHelper.sendVerifyEmail(req.body)
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(401).send(err); 
      });
  } catch (error) {
    res.status(500).send(error);
  }
};

// @desc    verify  user  using OTP
// @route   GET /user/otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email
    const otp = req.body.otp
    console.log('OTP:',email,otp);
    userHelper.verifyEmailOtp(email,otp)
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
    
      res.status(401).send(err); 
    });
   
  } catch (error) {
    res.status(500).send(error);
  }
};




module.exports={
 
    sendOTP,
    userLogin,
    verifyOTP
}