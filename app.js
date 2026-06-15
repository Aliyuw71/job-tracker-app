const express = require("express");
const app = express();
const jobRouter = require("./routes/jobRoute");
const userRouter = require("./routes/userRoute");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const connect = require("./db/connect");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

//Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Allow scripts from 'self', Tailwind CDN, and allow inline execution (convenient for development)
        scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }),
);
//CORS Application
app.use(cors());

app.use(express.json());

app.use(cookieParser()); //For saving token cookie for verification access
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/auth", userRouter);

app.use(express.static(path.join(__dirname, "public")));
app.use(notFound);
app.use(errorHandler);

//My fallback SPA(Single Page Application) route
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const dbUrl = process.env.MONGOOSE_URL;
const port = process.env.PORT || 3000;

const startapp = async () => {
  try {
    await connect(dbUrl);
    console.log("Database connected successfully");
    app.listen(port, console.log(`App listening on port ${port}`));
  } catch (err) {
    console.log(err);
  }
};
startapp();
