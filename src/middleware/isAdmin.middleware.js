
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); 
  } else {
    return res.status(401).json({ error: "You are not authorized to perform this action" });
  }
};
