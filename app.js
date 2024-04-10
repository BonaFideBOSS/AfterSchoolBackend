require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

const logRequest = require("./middlewares/logger");
app.use(logRequest("logs.txt"));

const lessonRouter = require("./routes/lesson");
app.use("/lessons", lessonRouter);

app.get("/", async (req, res) => {
  var data = "Hello world";
  res.send(data);
});

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
