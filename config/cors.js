const corsOptions = (proxyAllowed = false) => {
  return {
    origin: function (origin, callback) {
      const allowedOrigins = process.env.allowedOrigins;
      var isAllowed = allowedOrigins.indexOf(origin) !== -1;
      if (proxyAllowed) {
        isAllowed = !origin || isAllowed;
      }
      console.log("CORS: ", origin, isAllowed);
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(false);
      }
    },
  };
};

module.exports = corsOptions;
