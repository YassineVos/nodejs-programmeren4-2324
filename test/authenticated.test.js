// test/authenticated.test.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const { expect } = chai;
const { getAuthToken, TEST_USER } = require("./utils");

chai.use(chaiHttp);

describe("Authenticated User and Meal Tests", () => {
  let token = "";

  before(async function () {
    token = await getAuthToken();
  });

  describe("User CRUD Tests", () => {
    it("should return a list of users", (done) => {
      chai
        .request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data").that.is.an("array");
          done();
        });
    });

    it("should return the profile of the logged-in user", (done) => {
      chai
        .request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          expect(res.body.data).to.include({ username: TEST_USER.username });
          done();
        });
    });

    it("should successfully update a user", (done) => {
      chai
        .request(app)
        .put("/api/users/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "newusername" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .equal("User successfully updated");
          done();
        });
    });

    it("should successfully delete a user", (done) => {
      chai
        .request(app)
        .delete("/api/users/1")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .equal("User successfully deleted");
          done();
        });
    });
  });

  describe("Meal CRUD Tests", () => {
    it("should return a list of meals", (done) => {
      chai
        .request(app)
        .get("/api/meals")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data").that.is.an("array");
          done();
        });
    });

    it("should return the details of a specific meal", (done) => {
      chai
        .request(app)
        .get("/api/meals/1")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("data");
          done();
        });
    });

    it("should successfully add a new meal", (done) => {
      chai
        .request(app)
        .post("/api/meals")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New Meal", description: "Delicious" })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body)
            .to.have.property("message")
            .equal("Meal successfully added");
          done();
        });
    });

    it("should successfully update a meal", (done) => {
      chai
        .request(app)
        .put("/api/meals/1")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated Meal" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .equal("Meal successfully updated");
          done();
        });
    });

    it("should successfully delete a meal", (done) => {
      chai
        .request(app)
        .delete("/api/meals/1")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body)
            .to.have.property("message")
            .equal("Meal successfully deleted");
          done();
        });
    });
  });
});
