require('dotenv').config()
const express = require("express");

const app = express();
const PORT = process.env.PORT;

const logRequest = require("./middlewares/logger");
app.use(logRequest("logs.txt"));

const lessonRouter = require("./routes/lesson");
app.use("/", lessonRouter);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
