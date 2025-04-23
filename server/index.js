const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

//validating env variables
const requiredEnvVars = ['MONGODB_URI']; //'CORS_ORIGIN', 'JWT_SECRET' add later
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

app.use(express.json());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use((req,res,next)=>{
    next();
})

mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err.message);
})

const PORT = process.env.PORT || 3001;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
    // console.log(`✅ CORS enabled for origins: ${allowedOrigins.join(', ')}`);
})