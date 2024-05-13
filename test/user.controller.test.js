const chai = require("chai");
const chaiHttp = require("chai-http");
const { it, afterEach } = require("mocha");
const server = require("../index");
const pool = require("../mysql-pool-example");
require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const assert = require("assert");
const jwt = require("jsonwebtoken");
const { jwtSecretKey, logger } = require("../src/util/logger");

const testToken = process.env.JWT_TEST_TOKEN;
// let testToken = 0;

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
        emailAdress: "j.doe@server.com",
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
        emailAdress: "j.doe@server.com",
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

        res.should.have.status(401);
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
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "John",
        lastName: "Doe",
        emailAdress: "TEST1@avans.nl",
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
        message.should.be.a("string").that.equals("User already exists");

        done();
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
        phoneNumber: "123456789",
        street: "Mainstreet",
        city: "New York",
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
          .that.equals(`User created with id ${data.id}.`);
        data.should.be
          .an("object")
          .that.includes.keys(
            "id",
            "firstName",
            "lastName",
            "emailAdress",
            "street",
            "city"
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
        emailAdress: "j.doe@server.com", //Test user
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
      .get("/api/user")
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
      .get("/api/user?firstNAme=isduhkg&thirdname=doe")
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
      .get("/api/user?isActive=false")
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
      .get("/api/user?isActive=true")
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
      .get("/api/user?firstName=John&lastName=Doe")
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
        emailAdress: "j.doe@server.com", //Test user
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
  it("TC-203-2 Get user profile with valid token", (done) => {
    chai
      .request(server)
      .get("/api/user/1")
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
