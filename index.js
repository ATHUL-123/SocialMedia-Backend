const express = require('express')
const dotenv = require('dotenv')
const app = express()
const connect = require('./src/config/mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')


//importing Routes
const userRouter = require('./src/routes/userRouter')
const postRouter = require('./src/routes/postRouter')
const adminRouter= require('./src/routes/adminRouter')
app.use(cors());



//dotenv configuration
dotenv.config();

//mongoDB configuration
connect()







//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));



  // Apply the middleware to the userRouter path
  app.use("/api/users",userRouter);
  app.use("/api/posts",postRouter);
  app.use("/api/admin",adminRouter)







const port = process.env.LISTENING_PORT || 7003; // Change port number here


app.listen(port,()=>{
    console.log(`the server is listening on: `,`http://localhost:${port}`);
})

