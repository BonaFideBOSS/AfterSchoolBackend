const { MongoClient } = require("mongodb");

const URI = process.env.MONGO_URI;
let db;
try {
  const client = new MongoClient(URI);
  db = client.db("AfterSchool");
  console.log("Connected to database.");
} catch (e) {
  console.error(e);
}

module.exports = db;
