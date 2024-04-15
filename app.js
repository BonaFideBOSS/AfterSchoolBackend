require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.use(express.json());
app.use(cors());

const corsOptions = {
  origin: "https://bonafideboss.github.io/AfterSchool/",
  optionsSuccessStatus: 200,
};

const logRequest = require("./middlewares/logger");
app.use(logRequest());

const homeRouter = require("./routes/home");
app.use("/", homeRouter);

const lessonRouter = require("./routes/lesson");
lessonRouter.use(cors(corsOptions));
app.use("/lessons", lessonRouter);

const orderRouter = require("./routes/order");
orderRouter.use(cors(corsOptions));
app.use("/order", orderRouter);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
