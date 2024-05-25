const fs = require("fs");

function logRequest(filename = "logs.txt") {
  var date = new Date();
  date = date
    .toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");

  return (req, res, next) => {
    const sender = req.headers.origin || req.headers.host;
    var log = `${date} - ${sender} "${req.method} ${req.path} ${res.statusCode}"`;
    console.log(log, req.body);
    // fs.appendFile(`./logs/${filename}`, `${log}\n`, () => next());
    next();
  };
}

module.exports = logRequest;
