const corsOptions = {
  origin: function (origin, callback) {
    console.log("Request origin", origin);
    const allowedOrigins = process.env.allowedOrigins;
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

module.exports = corsOptions;
