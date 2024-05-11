// test/setup.js
const { getAuthToken } = require("./utils");

async function globalSetup() {
  await getAuthToken();
}

globalSetup();
