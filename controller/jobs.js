const { StatusCodes } = require("http-status-codes");
const Job = require("../model/jobs");
const BadRequest = require("../errors/badRequest");
const NotFound = require("../errors/notFound");
const mongoose = require("mongoose");
const moment = require("moment");
const getAllJobs = async (req, res) => {
  const { search, status, jobtype, sort, page, limit } = req.query;
  const filterObj = {
    createdBy: req.user.userId,
  };
  if (search) {
    filterObj.position = { $regex: search, $options: "i" };
  }
  if (status && status !== "all") {
    filterObj.status = status;
  }
  if (jobtype && jobtype !== "all") {
    filterObj.jobType = jobtype;
  }
  let result = Job.find(filterObj);
  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }
  const currentPage = page * 1 || 1;
  const currentLimit = limit * 1 || 10;
  const skip = (currentPage - 1) * currentLimit;
  result = result.skip(skip).limit(currentLimit);
  const jobs = await result;
  const totalJobs = await Job.countDocuments(filterObj);
  const numOfPages = Math.ceil(totalJobs / currentLimit);
  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};
const createJob = async (req, res) => {
  const { company, position, status, jobType, jobLocation } = req.body;
  if (!company || !position) {
    throw new BadRequest("Please provide company name and position");
  }
  const job = await Job.create({
    company: company,
    position: position,
    status: status,
    jobType: jobType,
    createdBy: req.user.userId,
    jobLocation: jobLocation,
  });
  res.status(StatusCodes.CREATED).json({ job });
};
const getOneJob = async (req, res) => {
  const { id: jobId } = req.params;
  const job = await Job.findOne({ createdBy: req.user.userId, _id: jobId });
  if (!job) {
    throw new NotFound(`Job with ID: ${jobId} not found`);
  }
  res.status(StatusCodes.OK).json({ job });
};
const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;
  if (!company || !position) {
    throw new BadRequest("Provide company name and position");
  }
  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    {
      runValidators: true,
      returnDocument: "after",
    },
  );
  if (!job) {
    throw new NotFound(`Job with ID: ${jobId} not found`);
  }
  res.status(StatusCodes.OK).json({ job });
};
const deleteJob = async (req, res) => {
  const {
    params: { id: jobId },
    user: { userId },
  } = req;
  const job = await Job.findOneAndDelete({ _id: jobId, createdBy: userId });
  if (!job) {
    throw new NotFound(`Job with ID: ${jobId} not found`);
  }
  res.status(StatusCodes.NO_CONTENT).send();
};
const showStat = async (req, res) => {
  let stats = await Job.aggregate([
    {
      $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  stats = stats.reduce((accumulator, currentValue) => {
    const { _id: title, count } = currentValue;
    accumulator[title] = count;
    return accumulator;
  }, {});
  const defaultStats = {
    interview: stats.interview || 0,
    pending: stats.pending || 0,
    declined: stats.declined || 0,
  };
  let monthlyApplication = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  monthlyApplication = monthlyApplication
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MM YY");
      return { date, count };
    })
    .reverse();
  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplication });
};
module.exports = {
  getAllJobs,
  createJob,
  getOneJob,
  updateJob,
  deleteJob,
  showStat,
};
const obj = {
  company: "Rogahn-Johnson",
  position: "Internal Auditor",
  status: "declined",
  jobType: "part-time",
  createdBy: "62f801d0510a7c1ed2312d52",
  createdAt: "2021-09-11T10:13:12Z",
};
