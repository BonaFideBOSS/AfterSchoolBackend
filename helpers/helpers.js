function isUserAdmin(password) {
  const adminPassword = process.env.adminPassword;
  if (password != adminPassword) {
    throw Error("Incorrect Password");
  }
}

module.exports = { isUserAdmin };
