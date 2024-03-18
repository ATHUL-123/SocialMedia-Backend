const adminHelper = require('../helpers/adminHelper')
const User = require('../models/userModel')



const adminLogin = async(req,res)=>{
    try {
      console.log('haaai');
    
    const {email,password} = req.body
    console.log(email,password);
      adminHelper.adminLogin(email,password)
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

const getAllUsers = async(req,res)=>{
  try {
     const users = await User.find({})
     if(users){
      res.status(200).json(users)
     }else{
      res.status(500).send({message:'DB_FETCH ERROR'});
     }
  } catch (error) {
     res.status(500).send(error)
  }
}

const userStatusToggle = async(req,res)=>{
  try {
     const userId = req.params.userId;
   adminHelper.block_Unblock_User(userId)
   .then((response)=>{
    res.status(200).json(response)
  })
  .catch((err)=>{
    res.status(500).send(err);
  })
  } catch (error) {
    res.status(500).send(error)
  }
}

module.exports={
    adminLogin,
    getAllUsers,
    userStatusToggle
}