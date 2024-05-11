const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const { expect } = chai;

chai.use(chaiHttp);

const TEST_USER = {
  firstName: "test",
  lastName: "user",
  emailAdress: "testuser@example.com",
  password: "secret",
  roles: "tester",
  street: "",
  city: "",
  isActive: "",
};

let token = "";

async function createTestUser() {
  try {
    const response = await chai.request(app).post("/api/user").send(TEST_USER);

    expect(response).to.have.status(201);
    console.log("User created successfully");
  } catch (err) {
    // If the user already exists (409 Conflict), log a warning and proceed with login
    if (err.status === 409 || err.response?.status === 409) {
      console.warn("User already exists, proceeding to login.");
    } else {
      throw err;
    }
  }
}

async function loginTestUser() {
  const response = await chai
    .request(app)
    .post("/api/login")
    .send({ username: TEST_USER.username, password: TEST_USER.password });

  expect(response).to.have.status(200);
  token = response.body.data.token;
  console.log("Token acquired successfully" + token);
  return token;
}

async function getAuthToken() {
  await createTestUser();
  return loginTestUser();
}

module.exports = {
  getAuthToken,
  TEST_USER,
};
