const corsOptions = (proxyAllowed = false) => {
  return {
    origin: function (origin, callback) {
      console.log("Request origin", origin);
      const allowedOrigins = process.env.allowedOrigins;
      var isAllowed = allowedOrigins.indexOf(origin) !== -1;
      if (proxyAllowed) {
        isAllowed = !origin || isAllowed;
      }
      if (isAllowed) {
        callback(null, true);
      } else {
        callback("Access Blocked", false);
      }
    },
  };
};

module.exports = corsOptions;
