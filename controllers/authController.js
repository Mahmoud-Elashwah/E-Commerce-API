const User = require("./../models/userModel");
const JWT = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const JWTsignIn = function (id) {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = function (theUser, status, res) {
  const token = JWTsignIn(theUser._id);
  theUser.password = undefined;
  res.status(status).json({
    status: "success",
    token,
    data: {
      user: theUser,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 403));
  }
  const theUser = await User.findOne({ email }).select("+password");
  if (!theUser || !(await theUser.checkPasswords(password, theUser.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(theUser, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Please login first", 401));
  }

  const decode = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this user doesn't exist", 403)
    );
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return AppError("You don't have permission to perform this action", 403);
    }
    next();
  };
};

exports.currentUser = catchAsync(async (req, res) => {
  if (!req.user || !req.user._id) {
    return AppError("Not authenticated", 401);
  }

  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return AppError("User not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
