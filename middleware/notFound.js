const { StatusCodes } = require("http-status-codes");
const notFound = async (req, res, next) => {
  res.status(StatusCodes.NOT_FOUND).send("<h1>Page not found!!!</h1>");
};
module.exports = notFound;
