

const socketIo_Config = (io) => {
    let users=[]
    io.on("connect", (socket) => {
        console.log("A client connected");
        io.emit('welcome', "this is server hi socket");
        socket.on("disconnect", () => {
            console.log("A client disconnected");
        });
   
        const removeUser = (socketId)=>{
            users = users.filter(user => user.socketId !== socketId);
        }
        const addUser = (userId,socketId)=>{
            !users.some(user=>user.userId === userId) &&
            users.push({userId,socketId})
            
        }
        const getUser = (userId) => {
            return users.find(user => user.userId === userId);
        }


        //connect and disconnect users

        socket.on('addUser',(userId)=>{
            addUser(userId,socket.id)
            io.emit('getUsers',users)
        })

        socket.on('disconnect',()=>{
            removeUser(socket.id)
            io.emit('getUsers',users)
        })

        //send and get messages

        socket.on("sendMessage", ({ senderId, recieverId, text }) => {
            console.log(users);
            const user = getUser(recieverId);
            if (user) {
                io.to(user.socketId).emit("getMessage", { senderId, text });
            } else {
                console.log(recieverId);
                console.log('users:',users);
                console.log("User not found");
                // Handle the case when user is not found
            }
        })
        
        // Listen for "typing" event from client
socket.on("typing", ({ senderId, recieverId }) => {
    const user = getUser(recieverId);
    if (user) {
        io.to(user.socketId).emit("userTyping", { senderId });
    }
});

// Listen for "stopTyping" event from client
socket.on("stopTyping", ({ senderId, recieverId }) => {
    const user = getUser(recieverId);
    if (user) {
        io.to(user.socketId).emit("userStopTyping", { senderId });
    }
});



socket.on("messageRead", ({ senderId }) => {
    console.log('hahahahah...message readed');
    // Update the message status in your database
    // Emit an event to the sender that the message has been read
    const senderSocket = users.find(user => user.userId === senderId);
    if (senderSocket) {
        io.to(senderSocket.socketId).emit("messageReadByRecipient");
    }
});
 
        
    });
};

module.exports = socketIo_Config;
