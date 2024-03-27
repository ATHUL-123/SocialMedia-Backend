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



const getAllUsers = async (req, res) => {
    try {
      console.log('jsjsj');
        const { limit, page } = req.query;
        console.log(limit,page);
        const users = await User.find({role:'User'})
                                .limit(parseInt(limit))
                                .skip(parseInt(limit) * (parseInt(page) - 1));
        const totalCount = await User.countDocuments({ role: 'User' });
        if (users) {
            res.status(200).json({users,totalCount});
        } else {
            res.status(500).json({ message: 'DB_FETCH ERROR' });
        }
    } catch (error) {
        res.status(500).json(error);
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

const getAllReports =async(req,res)=>{
  try {
    const {page,limit} = req.query
    adminHelper.getAllReports(page,limit)
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

const takeAction = async(req,res)=>{
  try {
    const {targetId} = req.query
    adminHelper.takeAction(targetId)
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
    userStatusToggle,
    getAllReports,
    takeAction
}