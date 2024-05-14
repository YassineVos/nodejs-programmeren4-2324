const chai = require("chai");
const chaiHttp = require("chai-http");
const { it, afterEach } = require("mocha");
const server = require("../index");
require("dotenv").config();

const assert = require("assert");

const testToken = process.env.JWT_TEST_TOKEN;

chai.should();
chai.use(chaiHttp);

function createLoginToken(server, loginDetails, done) {
  chai
    .request(server)
    .post("/api/login")
    .send(loginDetails)
    .end(function (error, response) {
      if (error) {
        throw error;
      }
      let loginToken = response.body.token;
      done(loginToken);
    });
}

describe("UC-101 Login", () => {
  it("TC-101-1 When a required input is missing, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .auth(testToken, { type: "bearer" })
      .send({
        emailAdress: "TEST1@avans.nl",
        //Password is missing
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("Password is required");

        done();
      });
  });
  it("TC-101-2 When an invalid password is provided, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAdress: "TEST1@avans.nl",
        password: 12345, //Password is not a string
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("Password must be a string");

        done();
      });
  });
  it("TC-101-3 When a user does not exist in the database, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAdress: "doesnotexist@server.com",
        password: "secret",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(404);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals("User not found or password invalid");

        done();
      });
  });
  it("TC-101-4 When a user is logged in successfully a valid response should be returned", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAdress: "TEST1@avans.nl",
        password: "secret",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("User logged in");
        data.should.be
          .an("object")
          .that.includes.keys(
            "id",
            "firstName",
            "lastName",
            "emailAdress",
            "token"
          );

        // Conditionally check for street and city only if they are present
        if (data.street) {
          data.should.include.keys("street");
        }
        if (data.city) {
          data.should.include.keys("city");
        }

        done();
      });
  });
});

describe("UC-201 Register", () => {
  it("TC-201-1 When a required input is missing, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "John",
        //lastName is missing
        emailAdress: "johndoe@server.com",
        password: "secret",
        street: "Mainstreet",
        city: "New York",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("Missing last name");

        done();
      });
  });
  it("TC-201-2 when an invalid email is provided, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "John",
        lastName: "Doe",
        emailAdress: "johndoe", //Invalid email format
        password: "secret",
        street: "Mainstreet",
        city: "New York",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("Invalid email address");

        done();
      });
  });
  it("TC-201-3 When a password is provided shorter then 6 cahractes, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "John",
        lastName: "Doe",
        emailAdress: "validEmail@server.com",
        phoneNumber: "1234567890",
        password: "12345", //Password is not a string
        street: "Mainstreet",
        city: "New York",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals("Password must be at least 6 characters long");

        done();
      });
  });
  it("TC-201-4 When a user already exists, a valid error should be returned", (done) => {
    const testUser = {
      firstName: "John",
      lastName: "Doe",
      emailAdress: "TESTFOREXISTING@avans.nl",
      password: "secret",
      phoneNumber: "1234567890",
      street: "Mainstreet",
      city: "New York",
      roles: "user",
    };

    // Create the user for the first time
    chai
      .request(server)
      .post("/api/user")
      .send(testUser)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        // Try to create the same user again
        chai
          .request(server)
          .post("/api/user")
          .send(testUser)
          .end((err, res) => {
            assert.ifError(err);

            res.should.have.status(403);
            res.should.be.an("object");
            res.body.should.be
              .an("object")
              .that.has.all.keys("status", "message", "data");

            let { status, message } = res.body;
            status.should.be.a("number");
            message.should.be.a("string").that.equals("User already exists");

            // Delete the user after the test
            chai
              .request(server)
              .post("/api/login")
              .send({
                emailAdress: testUser.emailAdress,
                password: testUser.password,
              })
              .end((loginErr, loginRes) => {
                if (loginErr) return done(loginErr);

                loginRes.should.have.status(200);
                const token = loginRes.body.data.token;

                chai
                  .request(server)
                  .delete(`/api/user/${loginRes.body.data.id}`)
                  .set("Authorization", `Bearer ${token}`)
                  .end((deleteErr, deleteRes) => {
                    if (deleteErr) return done(deleteErr);
                    deleteRes.should.have.status(200);
                    done();
                  });
              });
          });
      });
  });
  it("TC-201-5 When a user is created successfully a valid response should be returned", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "John",
        lastName: "Doe",
        emailAdress: "voorbeeld@server.com",
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`User created with id ${data.id}.`);
        data.should.be
          .an("object")
          .that.includes.keys(
            "id",
            "firstName",
            "lastName",
            "emailAdress",
            "street",
            "city",
            "roles"
          );

        chai
          .request(server)
          .post("/api/login")
          .send({
            emailAdress: "voorbeeld@server.com",
            password: "secret",
          })
          .end((loginErr, loginRes) => {
            if (loginErr) return done(loginErr);

            loginRes.should.have.status(200); // Ensure login was successful
            let token = loginRes.body.data.token; // Capture the token

            // Use the token to authorize a delete request
            chai
              .request(server)
              .delete(`/api/user/${data.id}`)
              .set("Authorization", `Bearer ${token}`) // Set the authorization header with the token
              .end((deleteErr, deleteRes) => {
                if (deleteErr) return done(deleteErr);
                deleteRes.should.have.status(200); // Assure that the delete operation was successful
                done();
              });
          });
      });
  });
});

describe("UC-202 Get all users", () => {
  //login with test user to get valid token
  let testToken;
  it("Login with test user to get valid token", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAdress: "TEST1@avans.nl", //Test user
        password: "secret", //Test user
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.ifError(err);
          testToken = res.body.data.token;
          done();
        }
      });
  });

  it("TC-202-1 Show all users (at least 2)", (done) => {
    chai
      .request(server)
      .get("/api/user/getAll")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        assert.ifError(err);
        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`Found ${data.length} users.`);

        data.should.be.an("array").that.has.length.greaterThan(1);
        data.forEach((user) => {
          user.should.be
            .an("object")
            .that.includes.keys(
              "id",
              "firstName",
              "lastName",
              "emailAdress",
              "isActive"
            );
        });

        done();
      });
  });
  it("TC-202-2 Show users on filter with non-existing field", (done) => {
    chai
      .request(server)
      .get("/api/user/getAll?firstNAme=isduhkg&thirdname=doe")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("Invalid field provided");

        done();
      });
  });
  it("TC-202-3 Show users using the filter 'isActive'=false", (done) => {
    chai
      .request(server)
      .get("/api/user/getAll?isActive=false")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`Found ${data.length} users.`);

        data.should.be.an("array");
        data.forEach((user) => {
          user.should.be
            .an("object")
            .that.includes.keys(
              "id",
              "firstName",
              "lastName",
              "emailAdress",
              "isActive"
            );
          user.isActive.should.be.a("number").that.equals(0);
        });

        done();
      });
  });
  it("TC-202-4 Show users using the filter 'isActive'=true", (done) => {
    chai
      .request(server)
      .get("/api/user/getAll?isActive=true")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`Found ${data.length} users.`);

        data.should.be.an("array");
        data.forEach((user) => {
          user.should.be
            .an("object")
            .that.includes.keys(
              "id",
              "firstName",
              "lastName",
              "emailAdress",
              "isActive"
            );
          user.isActive.should.be.a("number").that.equals(1);
        });

        done();
      });
  });
  it("TC-202-5 Show users using valid filters", (done) => {
    chai
      .request(server)
      .get("/api/user/getAll?firstName=John&lastName=Doe")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`Found ${data.length} users.`);

        data.should.be.an("array");
        data.forEach((user) => {
          user.should.be
            .an("object")
            .that.includes.keys(
              "id",
              "firstName",
              "lastName",
              "emailAdress",
              "isActive"
            );
          user.firstName.should.be.a("string").that.equals("John");
          user.lastName.should.be.a("string").that.equals("Doe");
        });

        done();
      });
  });
});

describe("UC-203 Get user profile", () => {
  let testToken;
  it("Login with test user to get valid token", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAdress: "TEST1@avans.nl", //Test user
        password: "secret", //Test user
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.ifError(err);
          testToken = res.body.data.token;
          done();
        }
      });
  });

  it("TC-203-1 Get user profile with invalid token", (done) => {
    chai
      .request(server)
      .get("/api/user/41")
      .set("Authorization", `Bearer invalidToken`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(401);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("Token invalid!");

        done();
      });
  });
  it("TC-203-2 Get user profile with valid token", (done) => {
    chai
      .request(server)
      .get("/api/user/41")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be.an("object").that.has.all.keys("message", "data");

        let { message, data } = res.body;
        message.should.be
          .a("string")
          .that.equals(`Found user with id ${data.id}.`);

        data.should.be
          .an("object")
          .that.includes.keys(
            "id",
            "firstName",
            "lastName",
            "emailAdress",
            "isActive"
          );

        done();
      });
  });
});

describe("UC-204 Get user by id", () => {
  let testToken;
  it("Login with test user to get valid token", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAdress: "TEST1@avans.nl", //Test user
        password: "secret",
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.ifError(err);
          testToken = res.body.data.token;
          done();
        }
      });
  });

  it("TC-204-1 Get user by id with invalid token", (done) => {
    chai
      .request(server)
      .get("/api/user/1")
      .set("Authorization", `Bearer invalidToken`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(401);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("Token invalid!");

        done();
      });
  });
  it("TC-204-2 Get user with id that doesn't exist", (done) => {
    chai
      .request(server)
      .get("/api/user/999999")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(404);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("data", "message", "status");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`User with id 999999 not found.`);
        data.should.be.an("object").that.is.empty;

        done();
      });
  });
  it("TC-204-3 Get user with id that exists", (done) => {
    chai
      .request(server)
      .get("/api/user/41")
      .set("Authorization", `Bearer ${testToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be.an("object").that.has.all.keys("message", "data");

        let { message, data } = res.body;
        message.should.be.a("string").that.equals(`Found user with id 41.`);
        data.should.be
          .an("object")
          .that.includes.keys(
            "id",
            "firstName",
            "lastName",
            "emailAdress",
            "isActive",
            "roles",
            "street",
            "city"
          );

        done();
      });
  });
});

describe("UC-205 Update user", () => {
  let userId;
  let updateTestToken;
  it("Create update test user and login for the tests", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Update",
        lastName: "Test",
        emailAdress: "updatetest@server.com",
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        userId = res.body.data.id;

        chai
          .request(server)
          .post("/api/login")
          .send({
            emailAdress: "updatetest@server.com",
            password: "secret",
          })
          .end((err, res) => {
            if (err) {
              done(err);
            } else {
              assert.ifError(err);
              updateTestToken = res.body.data.token;
              done();
            }
          });
      });
  });
  it("TC-205-1 Update user with missing valid field (emaiAdress)", (done) => {
    chai
      .request(server)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        firstName: "Update",
        lastName: "Test",
        //emailAdress is missing
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("Missing email");

        done();
      });
  });
  it("TC-205-2 Update user with other user, a valid error should be returned", (done) => {
    // first we need to create another user
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Other",
        lastName: "User",
        emailAdress: "otheruser@service.com",
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let otherUserId = res.body.data.id;

        chai
          .request(server)
          .put(`/api/user/${otherUserId}`)
          .set("Authorization", `Bearer ${updateTestToken}`)
          .send({
            firstName: "NewNameShoudlNotBeUpdated",
            lastName: "NewNameShoudlNotBeUpdated",
            emailAdress: "updatetest@server.com",
            password: "secret",
            phoneNumber: "1234567890",
            street: "Mainstreet",
            city: "New York",
            roles: "user",
          })
          .end((err, res) => {
            assert.ifError(err);

            res.should.have.status(403);
            res.should.be.an("object");
            res.body.should.be
              .an("object")
              .that.has.all.keys("status", "message", "data");

            let { status, message } = res.body;
            status.should.be.a("number");
            message.should.be
              .a("string")
              .that.equals("You are not authorized to update this user.");

            // Delete the other user after the test
            chai
              .request(server)
              .post("/api/login")
              .send({
                emailAdress: "otheruser@service.com",
                password: "secret",
              })
              .end((loginErr, loginRes) => {
                if (loginErr) return done(loginErr);

                loginRes.should.have.status(200);
                const token = loginRes.body.data.token;

                chai
                  .request(server)
                  .delete(`/api/user/${otherUserId}`)
                  .set("Authorization", `Bearer ${token}`)
                  .end((deleteErr, deleteRes) => {
                    if (deleteErr) return done(deleteErr);
                    deleteRes.should.have.status(200);
                    done();
                  });
              });
          });
      });
  });
  it("TC-205-3 Update user with invalid phoneNumber, a valid error should be returned", (done) => {
    chai
      .request(server)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        firstName: "Update",
        lastName: "Test",
        emailAdress: "updatetest@server.com",
        password: "secret",
        phoneNumber: "123456789", // phone number withh only 9 digits
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals("Phone number must be 10 characters long");

        done();
      });
  });
  it("TC-205-4 Update non existing user, a valid error should be returned", (done) => {
    chai
      .request(server)
      .put(`/api/user/999999`)
      .set("Authorization", `Bearer ${updateTestToken}`)
      .send({
        firstName: "Update",
        lastName: "Test",
        emailAdress: "nonexistinguser@server.com",
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(404);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`User with id 999999 not found.`);

        done();
      });
  });
  it("TC-205-5 Update user without logging in, a valid error should be returned", (done) => {
    chai
      .request(server)
      .put(`/api/user/{userId}`)
      .send({
        firstName: "Update",
        lastName: "Test",
        emailAdress: "updatetest@server.com",
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(401);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("No token provided!");

        done();
      });
  });
  it("TC-205-6 Update user succesfully", (done) => {
    chai
      .request(server)
      .put(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${updateTestToken}`)
      .send({
        firstName: "Updated",
        lastName: "Test",
        emailAdress: "updatetest@server.com",
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`User updated with id ${data.id}.`);

        data.should.be
          .an("object")
          .that.includes.keys(
            "id",
            "firstName",
            "lastName",
            "emailAdress",
            "password",
            "phoneNumber",
            "roles",
            "street",
            "city"
          );

        done();
      });
  });
  it("Delete the test user after the tests", (done) => {
    chai
      .request(server)
      .delete(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${updateTestToken}`)
      .end((err, res) => {
        assert.ifError(err);
        res.should.have.status(200);
        done();
      });
  });
});

describe("UC-206 Delete user", () => {
  let testDeleteToken;
  it("Login with test user to get valid token", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAdress: "TEST1@avans.nl", //Test user
        password: "secret",
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.ifError(err);
          testDeleteToken = res.body.data.token;
          done();
        }
      });
  });

  it("TC-206-1 Delete non-exisiting user, a valid error should be returned", (done) => {
    chai
      .request(server)
      .delete("/api/user/999999")
      .set("Authorization", `Bearer ${testDeleteToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(404);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`User with id 999999 not found.`);
        data.should.be.an("object").that.is.empty;

        done();
      });
  });

  it("TC-206-2 Delete user without logging verin", (done) => {
    chai
      .request(server)
      .delete("/api/user/41")
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(401);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("No token provided!");

        done();
      });
  });
  it("TC-206-3 Delete user that is not the same as the logged in user", (done) => {
    chai
      .request(server)
      .delete("/api/user/46")
      .set("Authorization", `Bearer ${testDeleteToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(403);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals("You are not authorized to delete this user.");

        done();
      });
  });
  it("TC-206-4 Delete user succesfully", (done) => {
    // first create a user to delete
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Delete",
        lastName: "Test",
        emailAdress: "deleteuser@avans.nl",
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let deleteUserId = res.body.data.id;

        // login with the user to get the token
        chai
          .request(server)
          .post("/api/login")
          .send({
            emailAdress: "deleteuser@avans.nl",
            password: "secret",
          })
          .end((err, res) => {
            if (err) {
              done(err);
            } else {
              assert.ifError(err);
              const deleteToken = res.body.data.token;

              // delete the user
              chai
                .request(server)
                .delete(`/api/user/${deleteUserId}`)
                .set("Authorization", `Bearer ${deleteToken}`)
                .end((err, res) => {
                  assert.ifError(err);

                  res.should.have.status(200);
                  res.should.be.an("object");
                  res.body.should.be
                    .an("object")
                    .that.has.all.keys("status", "message", "data");

                  let { status, message, data } = res.body;
                  status.should.be.a("number");
                  message.should.be
                    .a("string")
                    .that.equals(`User with id ${deleteUserId} deleted.`);

                  done();
                });
            }
          });
      });
  });
});

// meal tests --------------------------------------------------------------

describe("UC-301 Create meal", () => {
  let testMealId;
  let testMealToken;

  it("Create user for the tests", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Meal",
        lastName: "Test",
        emailAdress: "mealtester@avans.nl",
        password: "secret",
        phoneNumber: "1234567890",
        street: "Mainstreet",
        city: "New York",
        roles: "user",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        chai
          .request(server)
          .post("/api/login")
          .send({
            emailAdress: "mealtester@avans.nl",
            password: "secret",
          })
          .end((err, res) => {
            if (err) {
              done(err);
            } else {
              assert.ifError(err);
              testMealToken = res.body.data.token;
              testMealId = res.body.data.id;
              done();
            }
          });
      });
  });

  it("TC-301-1 Create meal with missing required field (name)", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set("Authorization", `Bearer ${testMealToken}`)
      .send({
        //name is missing
        description: "A description",
        price: 10.0,
        category: "Lunch",
        isActive: 1,
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(400);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(
            "Missing required fields: name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, or allergenes"
          );

        done();
      });
  });

  it("TC-301-2 Create meal without logging in, a valid error should be returned", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .send({
        name: "TestMeal",
        description: "A description",
        price: 10.0,
        category: "Lunch",
        isActive: 1,
        isVega: 0,
        isVegan: 0,
        isToTakeHome: 0,
        dateTime: "2021-06-01T12:00:00",
        maxAmountOfParticipants: 10,
        imageUrl: "https://www.google.com",
        allergenes: "Gluten",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(401);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals("No token provided!");

        done();
      });
  });

  it("TC-301-3 Create meal succesfully", (done) => {
    chai
      .request(server)
      .post("/api/meal")
      .set("Authorization", `Bearer ${testMealToken}`)
      .send({
        name: "TestMeal",
        description: "A description",
        price: 10.0,
        category: "Lunch",
        isActive: true,
        isVega: false,
        isVegan: true,
        isToTakeHome: false,
        dateTime: "2021-06-01T12:00:00",
        maxAmountOfParticipants: 10,
        imageUrl: "https://www.google.com",
        allergenes: "Gluten",
      })
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be.a("string").that.equals(`Meal created successfully`);

        done();
      });
  });

  it("Delete test user after the tests", (done) => {
    chai
      .request(server)
      .delete(`/api/user/${testMealId}`)
      .set("Authorization", `Bearer ${testMealToken}`)
      .end((err, res) => {
        assert.ifError(err);
        res.should.have.status(200);
        done();
      });
  });
});

describe("UC-303 Get all meals", () => {
  let testMealToken;

  it("Login with test user to get valid token ", (done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        emailAdress: "TEST1@avans.nl",
        password: "secret",
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.ifError(err);
          testMealToken = res.body.data.token;
          done();
        }
      });
  });

  it("TC-303-1 Get list of all meals", (done) => {
    chai
      .request(server)
      .get("/api/meal")
      .set("Authorization", `Bearer ${testMealToken}`)
      .end((err, res) => {
        assert.ifError(err);

        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be
          .an("object")
          .that.has.all.keys("status", "message", "data");

        let { status, message, data } = res.body;
        status.should.be.a("number");
        message.should.be
          .a("string")
          .that.equals(`All meals retrieved successfully`);

        data.should.be.an("array");
        data.forEach((meal) => {
          meal.should.be
            .an("object")
            .that.includes.keys(
              "id",
              "name",
              "cookId",
              "description",
              "price",
              "isActive",
              "isVega",
              "isVegan",
              "isToTakeHome",
              "dateTime",
              "maxAmountOfParticipants",
              "imageUrl",
              "allergenes",
              "createDate",
              "updateDate"
            );
        });

        done();
      });
  });
});

describe("UC-304 Get meal by id", () => {
  let testMealToken;
  it("Login to get valid token", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        emailAdress: "TEST1@avans.nl",
        password: "secret",
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.ifError(err);
          testMealToken = res.body.data.token;
          done();
        }
      });
  });

  // it("UC-304-1 Get meal by id without logging in", (done) => {});
  // it("UC-304-2 Get meal by id with valid token", (done) => {});
});
