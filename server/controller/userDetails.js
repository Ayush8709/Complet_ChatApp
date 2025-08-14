import getUserDetailsFromToken from '../helpers/getUserDetailsFromToken.js';

 const userDetails = async (req, res) => {
  try {
    // 🔐 Get token from cookies
    const token = req.cookies.token || "";

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing",
        error: true,
      });
    }

    // 🧠 Get user info from token
    const user = await getUserDetailsFromToken(token);

    if (!user?._id) {
      return res.status(401).json({
        message: "Invalid or expired token",
        error: true,
      });
    }

    return res.status(200).json({
      message: "User details fetched successfully",
      data: user,
      success: true,
    });

  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
    });
  }
};
export default userDetails;