const Conversation = require('../models/conversationModel')
const Message      = require('../models/messagesModel')


const addConversation = (members, lastMessage, lastMessageTime) => {
    return new Promise((resolve, reject) => {
        try {
            // Check if conversation already exists
            Conversation.findOne({ members: { $all: members } })
                .then(existingConversation => {
                    if (existingConversation) {
                        // Update existing conversation
                        existingConversation.lastMessage = lastMessage;
                        existingConversation.lastMessageTime = lastMessageTime;
                        existingConversation.save()
                            .then(updatedConversation => {
                                resolve({
                                    data: updatedConversation,
                                    status: 200,
                                    message: 'Conversation updated successfully'
                                });
                            })
                            .catch(error => {
                                reject(error);
                            });
                    } else {
                        // Create a new conversation instance
                        const newConversation = new Conversation({
                            members,
                            lastMessage,
                            lastMessageTime
                        });

                        // Save the conversation to the database
                        newConversation.save()
                            .then(savedConversation => {
                                resolve({
                                    data: savedConversation,
                                    status: 200,
                                    message: 'Conversation created successfully'
                                });
                            })
                            .catch(error => {
                                reject(error);
                            });
                    }
                })
                .catch(error => {
                    reject(error);
                });
        } catch (error) {
            reject(error); // Throw error if something goes wrong
        }
    });
};


const getAllConversationsByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        try {
            // Find conversations where the given userId is a member
            Conversation.find({ members: { $in: [userId] } })
                .then(conversations => {
                    resolve({
                        data: conversations,
                        status: 200,
                        message: 'Conversations retrieved successfully'
                    });
                })
                .catch(error => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
};

const addMessage = ( conversationId,senderId, text) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new message instance
            console.log(conversationId,'conv id');
            const newMessage = new Message({
                senderId,
                conversationId,
                text
            });

            // Save the message to the database
            newMessage.save()
                .then(savedMessage => {
                    resolve({
                        data: savedMessage,
                        status: 200,
                        message: 'Message created successfully'
                    });
                })
                .catch(error => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
};

const getAllMessages = (conversationId) => {
    return new Promise((resolve, reject) => {
        try {
            // Find all messages in the conversation
            console.log(conversationId);
            Message.find({ conversationId })
                .then(messages => {
                    resolve({
                        data: messages,
                        status: 200,
                        message: 'Messages retrieved successfully'
                    });
                })
                .catch(error => {
                    reject(error);
                });
        } catch (error) {
            reject(error);
        }
    });
};

const messageReaded = async (conversationId, readerId) => {
    try {
        console.log(conversationId, readerId);
        // Update messages' isRead field where senderId is not equal to readerId
        const result = await Message.updateMany(
            { conversationId: conversationId, senderId: { $ne: readerId } },
            { $set: { isRead: true } }
        );

        console.log('Messages marked as read successfully');

        // Fetch the updated messages
        const messages = await Message.find({ conversationId: conversationId });

        return {
            data: messages,
            status: 200,
            message: 'Messages marked as read successfully'
        };
    } catch (error) {
        throw error;
    }
};


module.exports ={ 
    addConversation,
    getAllConversationsByUserId,
    addMessage,
    getAllMessages,
    messageReaded

}