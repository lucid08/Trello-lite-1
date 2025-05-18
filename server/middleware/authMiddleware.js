import jwt from 'jsonwebtoken';
import {User} from '../models/user.model.js';

const protect = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
}

export default protect;