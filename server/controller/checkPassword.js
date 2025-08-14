import User from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const checkPassword = async (req, res) => {
  try {
    const { password, userId } = req.body;

 
    if (!password || !userId) {
      return res.status(400).json({ message: "Password and userId are required." });
    }

 
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const tokenData = { id: user._id, email: user.email };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, { expiresIn: '1d' }); 

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    };

    return res
      .cookie('token', token, cookieOptions)
      .status(200)
      .json({
        message: "Login successful",
        token: token
      });

  } catch (error) {
    console.error("Error in checkPassword:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong."
    });
  }
};

export default checkPassword;
