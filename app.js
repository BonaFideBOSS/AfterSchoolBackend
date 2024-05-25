require("dotenv").config();
const express = require("express");
const flash = require("express-flash");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/assets"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

const logRequest = require("./middlewares/logger");
app.use(logRequest());

const homeRouter = require("./routes/home");
app.use("/", homeRouter);

const lessonRouter = require("./routes/lesson");
app.use("/lessons", lessonRouter);

const orderRouter = require("./routes/order");
app.use("/order", orderRouter);

app.all("*", (req, res) => {
  res.render("404.ejs");
});

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
