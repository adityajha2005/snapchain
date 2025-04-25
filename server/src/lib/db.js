const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const uri = "process.env.MONGODB_URI";
if(!uri){
    console.error("Missing required env variable : MONGODB_URI")
    process.exit(1);
}
let isConnected= false;
async function connecttoDatabase() {
    if(isConnected){
        return mongoose.connection;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
    isConnected = true;
    console.log("Connected to MongoDB");
    return mongoose.connection;
    } catch(error){
        console.log("Error connecting to MongoDB:", error.message);
        throw error;
    }
}
module.exports = {connecttoDatabase};
