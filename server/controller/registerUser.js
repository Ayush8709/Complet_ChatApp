import UserModel from "../models/UserModel.js";
import bcryptjs from "bcryptjs";

async function registerUser(req, res) {
    try {
        const { name, email, password, profile_pic } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required.",
                error: true,
            });
        }


        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists.",
                error: true,
            });
        }


        const hashedPassword = await bcryptjs.hash(password, 10);


        const newUser = new UserModel({
            name,
            email,
            profile_pic,
            password: hashedPassword,
        });


        const savedUser = await newUser.save();


        return res.status(201).json({
            message: "User created successfully.",
            data: {
                _id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                profile_pic: savedUser.profile_pic,
            },
            success: true,
        });

    } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
        });
    }
}

export default registerUser;
