const express = require("express");
const jobRouter = express.Router();
const {
  getAllJobs,
  createJob,
  getOneJob,
  updateJob,
  deleteJob,
  showStat,
} = require("../controller/jobs");
const authenticator = require("../middleware/authenticator");
jobRouter
  .route("/")
  .get(authenticator, getAllJobs)
  .post(authenticator, createJob);
jobRouter.route("/stats").get(authenticator, showStat);
jobRouter
  .route("/:id")
  .get(authenticator, getOneJob)
  .patch(authenticator, updateJob)
  .delete(authenticator, deleteJob);
module.exports = jobRouter;
