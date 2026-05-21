const roleCheck = (allowedRoles) => (req, res, next) => {
  const sysRole = req.user?.sys_role;
  if (sysRole === undefined || sysRole === null) {
    return res.status(403).json({ message: 'Forbidden: Role information missing. Please re-login.' });
  }
  if (!allowedRoles.includes(Number(sysRole))) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
  }
  next();
};

module.exports = roleCheck;
