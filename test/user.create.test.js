const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");
const tracer = require("tracer");
const expect = chai.expect;

chai.should();
chai.use(chaiHttp);
tracer.setLevel("warn");

const endpointToTest = "/api/users";

describe("UC201 Registreren als nieuwe user", () => {
  /**
   * Voorbeeld van een beforeEach functie.
   * Hiermee kun je code hergebruiken of initialiseren.
   */
  beforeEach((done) => {
    done();
  });

  /**
   * Hier starten de testcases
   */
  it("TC-201-1 Verplicht veld ontbreekt", (done) => {
    chai
      .request(server)
      .post(endpointToTest)
      .send({
        // firstName: 'Voornaam', ontbreekt
        lastName: "Achternaam",
        emailAdress: "v.a@server.nl",
      })
      .end((err, res) => {
        /**
         * Voorbeeld uitwerking met chai.expect
         */
        chai.expect(res).to.have.status(400);
        chai.expect(res).not.to.have.status(200);
        chai.expect(res.body).to.be.a("object");
        chai.expect(res.body).to.have.property("status").equals(400);
        chai
          .expect(res.body)
          .to.have.property("message")
          .equals("Missing first name");
        chai.expect(res.body).to.have.property("data").that.is.a("object").that
          .is.empty;

        done();
      });
  });

  it("TC-201-2 Niet-valide email adres", (done) => {
    chai
      .request(server)
      .post("/api/users")
      .send({
        firstName: "Jan", // Valid first name
        lastName: "De Boer", // Valid last name
        emailAdress: "jan.de.boer", // Invalid email, missing domain
      })
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body)
          .to.have.property("message")
          .eql("Invalid email address");
        done();
      });
  });

  // it.skip("TC-201-3 Niet-valide password", (done) => {});

  it("TC-201-4 Gebruiker bestaat al", (done) => {
    // First, create a user to populate the database
    chai
      .request(server)
      .post("/api/users")
      .send({
        firstName: "Existing",
        lastName: "User",
        emailAdress: "existing.user@example.com",
      })
      .end((err, res) => {
        // Ensure the user was created successfully
        expect(res).to.have.status(200);

        // Attempt to create the same user again
        chai
          .request(server)
          .post("/api/users")
          .send({
            firstName: "Existing",
            lastName: "User",
            emailAdress: "existing.user@example.com",
          })

          .end((err, res) => {
            // Expect a failure due to duplicate email
            expect(res).to.have.status(400);
            expect(res.body).to.be.an("object");
            expect(res.body)
              .to.have.property("message")
              .eql("User already exists");
            done();
          });
      });
  });

  it("TC-201-5 Gebruiker succesvol geregistreerd", (done) => {
    chai
      .request(server)
      .post(endpointToTest)
      .send({
        firstName: "Voornaam",
        lastName: "Achternaam",
        emailAdress: "v.a@server.nl",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");

        res.body.should.have.property("data").that.is.a("object");
        res.body.should.have.property("message").that.is.a("string");

        const data = res.body.data;
        data.should.have.property("firstName").equals("Voornaam");
        data.should.have.property("lastName").equals("Achternaam");
        data.should.have.property("emailAdress");
        data.should.have.property("id").that.is.a("number");

        done();
      });
  });
});

const endpointToUpdate = "/api/user";

describe("UC205 Update existing user", () => {
  let userId; // Variable to store user ID for update tests

  // Create a user to update in each test
  beforeEach((done) => {
    chai
      .request(server)
      .post("/api/user")
      .send({
        firstName: "Initial",
        lastName: "User",
        emailAdress: "initial.user@example.com",
      })
      .end((err, res) => {
        userId = res.body.data.id; // Save the user id for use in tests
        done();
      });
  });

  afterEach((done) => {
    // Clean up database after each test if necessary
    done();
  });
  it("TC-202-1 Update with missing fields", (done) => {
    chai
      .request(server)
      .put(`${endpointToUpdate}/${userId}`)
      .send({ lastName: "Updated" }) // Intentionally missing firstName and email
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body)
          .to.have.property("message")
          .eql("Missing required fields");
        done();
      });
  });
  it("TC-202-2 Update with invalid email address", (done) => {
    chai
      .request(server)
      .put(`${endpointToUpdate}/${userId}`)
      .send({
        firstName: "Updated",
        lastName: "User",
        emailAdress: "updated.email",
      }) // Invalid email
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.be.an("object");
        expect(res.body)
          .to.have.property("message")
          .eql("Invalid email address");
        done();
      });
  });
  it("TC-202-3 Valid update", (done) => {
    chai
      .request(server)
      .put(`${endpointToUpdate}/${userId}`)
      .send({
        firstName: "Updated",
        lastName: "User",
        emailAdress: "updated.user@example.com",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body.data).to.include({
          firstName: "Updated",
          lastName: "User",
          emailAdress: "updated.user@example.com",
        });
        done();
      });
  });
  it("TC-202-4 Update non-existing user", (done) => {
    chai
      .request(server)
      .put(`${endpointToUpdate}/999999`) // Assuming 999999 is an ID that does not exist
      .send({
        firstName: "NonExistent",
        lastName: "User",
        emailAdress: "nonexistent.user@example.com",
      })
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("message").eql("User not found");
        done();
      });
  });
});
