import User from '../models/UserModel.js';

const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User does not exist." });
    }

    return res.status(200).json({
      message: "Email verified",
      data: user
    });

  } catch (error) {
    console.error("Error in checkEmail:", error);
    return res.status(500).json({
      message: error.message || "Something went wrong."
    });
  }
};

export default checkEmail;
