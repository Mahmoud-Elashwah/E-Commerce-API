const User = require("./../models/userModel");
const JWT = require("jsonwebtoken");
const { promisify } = require("util");

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

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(403).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }
    const theUser = await User.findOne({ email }).select("+password");
    if (
      !theUser ||
      !(await theUser.checkPasswords(password, theUser.password))
    ) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }
    createSendToken(theUser, 200, res);
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Please login first",
      });
    }

    const decode = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decode.id);
    if (!currentUser) {
      return res.status(403).json({
        status: "fail",
        message: "The user belonging to this user doesn't exist",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You don't have permission to perform this action",
      });
    }
    next();
  };
};

exports.currentUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        status: "fail",
        message: "Not authenticated",
      });
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};
