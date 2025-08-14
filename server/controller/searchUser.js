import UserModel from '../models/UserModel.js';

 const searchUser = async (req, res) => {
    try {
        const { search } = req.body;

        if (!search || search.trim() === "") {
            return res.status(400).json({
                message: "Search term is required",
                error: true,
            });
        }

        // 🔍 Create case-insensitive regex
        const query = new RegExp(search, 'i'); // Create a case-insensitive regex to match name or email partially


        // 🧠 Search users by name or email
        const users = await UserModel.find({
            $or: [
                { name: query },
                { email: query }
            ]
        }).select('-password');

        return res.status(200).json({
            message: 'Users found',
            data: users,
            success: true
        });

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({
            message: error.message || "Internal server error",
            error: true
        });
    }
};
export default searchUser