import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name provide"]
    },
    email:{
        type:String,
        required:[true,"Email Provide"]
    },
    password:{
        type:String,
        required:[true,"Provide password"]
    },
    profile_pic:{
        type:String,
        default:''
    }
},{timestamps: true})


const User = mongoose.model("User", userSchema)

export default User