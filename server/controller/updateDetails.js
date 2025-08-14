import getUserDetailsFromToken from '../helpers/getUserDetailsFromToken.js';
import UserModel from '../models/UserModel.js';

 const updateUserDetails = async (req, res) => {
  try {
    // 🧠 Get token from cookies
    const token = req.cookies.token || "";

    // 🔐 Extract user from token
    const user = await getUserDetailsFromToken(token);

    if (!user?._id) {
      return res.status(401).json({
        message: "Unauthorized or invalid token",
        error: true,
      });
    }

    const { name, profile_pic } = req.body;
    console.log('this is name', name)

    // ✅ Optional validation
    if (!name && !profile_pic) {
      return res.status(400).json({
        message: "At least one field (name or profile_pic) must be provided",
        error: true,
      });
    }

    // 📦 Update user details
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { name, profile_pic } }
    );

    // 🔁 Get updated user info (excluding password)
    const updatedUser = await UserModel.findById(user._id).select("-password");

    return res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
      success: true,
    });

  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
    });
  }
};

export default updateUserDetails;