const BadRequest = require("../errors/badRequest");
const jwt = require("jsonwebtoken");

const authenticator = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    throw new BadRequest("Please login with valid credentials");
  }
  try {
    const decoder = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = { userId: decoder.userId, name: decoder.name };
    next();
  } catch (err) {
    console.log(err);
  }
};
module.exports = authenticator;
