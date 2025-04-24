const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        minlength:4,
        unique:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        trim:true
    },
    github:{
        type:String,
        lowercase:true,
        match: [/^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+$/, "Please use a valid GitHub URL"]
    },
    password:{
        type:String,
        required:true,
        minLength:8,
    }
},{timestamps:true});

//hashing pass before saving
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(e){
        next(e);
    }
})

userSchema.methods.comparePassword = async function (plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
};
//never pass in json response
userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password;
        return ret;
    }
});

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports.Message = mongoose.model("Message", messageSchema);

module.exports= mongoose.model("User",userSchema)