const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.allowedOrigins;
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

module.exports = corsOptions;
