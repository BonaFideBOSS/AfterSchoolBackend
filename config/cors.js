const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.allowedOrigins;
    console.log("Request Origin", origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

module.exports = corsOptions;
