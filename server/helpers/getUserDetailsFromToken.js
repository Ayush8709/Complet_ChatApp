import jwt from 'jsonwebtoken';
import UserModel from '../models/UserModel.js';

const getUserDetailsFromToken = async (token) => {
  try {
    if (!token) {
      return {
        message: "Session expired. Please log in again.",
        logout: true,
      };
    }

    // 🔐 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); 

    const user = await UserModel.findById(decoded.id).select('-password');

    if (!user) {
      return {
        message: "User not found.",
        logout: true,
      };
    }

    return user;

  } catch (error) {
    console.error("JWT Error:", error.message);
    return {
      message: "Invalid or expired token.",
      logout: true,
    };
  }
};

export default getUserDetailsFromToken;
