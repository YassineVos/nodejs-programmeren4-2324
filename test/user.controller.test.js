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

describe("UC-User", () => {
  describe("UC-101 login", () => {
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

  describe("UC-102 register", () => {
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
  });
});
