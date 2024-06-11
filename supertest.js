const request = require("supertest");
const app = require("../index.js"); // Adjust the path as per your app setup

// A helper function to get an authentication token
async function getAuthToken() {
  const response = await request(app)
    .post("/api/login") // Adjust the login path if necessary
    .send({
      email: "testuser@example.com", // Use a valid test email
      password: "testpassword", // Use a valid test password
    });

  return response.body.token; // Adjust according to your login response
}
