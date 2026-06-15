const { StatusCodes } = require("http-status-codes");
const errorHandler = async (err, req, res, next) => {
  console.log(err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    msg: err.message || "Something went wrong",
  });
};
module.exports = errorHandler;
