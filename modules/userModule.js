const mongoose = require("mongoose");
const validator = require("validator");
validator;
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "The user should have a name"],
    },
    email: {
      type: String,
      required: [true, "The user should have a email"],
      validate: {
        validator: (val) => {
          return validator.isEmail(val);
        },
        message: "please provide a valid email",
      },
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    password: {
      type: String,
      minlength: 8,
      required: [true, "The user should have a password"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "The user should have a passwordConfirm"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "paasword are not the same",
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPasswords = async function (
  enteredPassword,
  thePassword
) {
  return await bcrypt.compare(enteredPassword, thePassword);
};

module.exports = mongoose.model("User", userSchema);
