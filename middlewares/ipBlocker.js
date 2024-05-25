function apiGuard() {
  return (req, res, next) => {
    const allowedOrigins = process.env.allowedOrigins;
    var isAllowed = allowedOrigins.indexOf(req.headers.origin) !== -1;
    console.log("Ip allowed: ", req.headers.origin, isAllowed);
    if (isAllowed) {
      next();
    } else {
      res.status(400).send("");
    }
  };
}

module.exports = apiGuard;
