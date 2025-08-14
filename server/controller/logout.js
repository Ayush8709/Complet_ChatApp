const logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    };

    res.cookie('token', '', { ...cookieOptions, maxAge: 0 });

    return res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Something went wrong during logout',
    });
  }
};

export default logout;
