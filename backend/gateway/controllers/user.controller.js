export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "User not authenticated" });
  }

  return res.status(200).json({
    success: true,
    user: req.user,
  });
};
