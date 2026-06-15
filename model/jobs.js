const mongoose = require("mongoose");
const obj = {
  company: "Rogahn-Johnson",
  position: "Internal Auditor",
  status: "declined",
  jobType: "part-time",
  createdBy: "62f801d0510a7c1ed2312d52",
  createdAt: "2021-09-11T10:13:12Z",
};

const JobsSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide company name"],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, "Please provide the position you are applying for"],
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["pending", "interview", "declined"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user details"],
    },
    jobType: {
      type: String,
      enum: ["part-time", "full-time", "remote", "internship"],
      default: "full-time",
    },
    jobLocation: {
      type: String,
      default: "my city",
      required: [true, "Provide Job location"],
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Job", JobsSchema);
