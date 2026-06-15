const User = require("../model/user");
const { StatusCodes } = require("http-status-codes");
const Unauthenticated = require("../errors/unauthenticated");
const BadRequest = require("../errors/badRequest");
const NotFound = require("../errors/notFound");

const register = async (req, res) => {
  const user = await User.create(req.body);
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ user, token });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Unauthenticated("Invalid login details");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new Unauthenticated("Invalid login details");
  }
  const passwordIsvalid = await user.comparePassword(password);
  if (!passwordIsvalid) {
    throw new Unauthenticated("Invalid Credentials");
  }
  const token = user.createJWT();
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(StatusCodes.OK).json({ user, token });
};
const updateUser = async (req, res) => {
  const { name, email, location, lastName } = req.body;
  if (!name || !email || !location || !lastName) {
    throw new BadRequest("Provide all details");
  }
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new NotFound("User not found");
  }
  user.name = name;
  user.email = email;
  user.location = location;
  user.lastName = lastName;
  await user.save();
  const token = user.createJWT();
  res
    .status(StatusCodes.OK)
    .json({
      user: {
        name: user.name,
        email: user.email,
        lastName: user.lastName,
        location: user.location,
      },
      token,
    });
};
module.exports = { register, login, updateUser };
