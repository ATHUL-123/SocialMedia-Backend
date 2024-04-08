const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')
const authMiddleware = require('../middleware/authMiddleware')


router.post('/conversation',chatController.createConversation)

router.get('/conversation',authMiddleware.protect,chatController.getConversations)

router.post('/message',chatController.addMessage)

router.get('/message/:conversationId',chatController.getAllMessages)

router.patch('/message/read/:conversationId/:readerId',chatController.messageReaded)





module.exports=router