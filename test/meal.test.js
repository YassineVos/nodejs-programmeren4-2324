require("./setup.test");
const jwt = require("jsonwebtoken");
const config = require("../src/util/config");

describe("Meal API Tests", () => {
  let token;
  let cookId = 1;

  before((done) => {
    // Generate a JWT token for testing
    token = jwt.sign({ userId: cookId }, config.secretkey, { expiresIn: "1d" });
    done();
  });

  describe("UC-301: Create a new meal", () => {
    it("should create a new meal successfully", (done) => {
      request(server)
        .post("/api/meal")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Vegetarian Curry",
          description:
            "A delicious curry made with fresh vegetables and spices.",
          isActive: true,
          isVega: true,
          isVegan: false,
          isToTakeHome: true,
          dateTime: "2024-05-15 18:30:00",
          maxAmountOfParticipants: 10,
          price: 9.5,
          imageUrl: "https://example.com/vegetarian-curry.jpg",
          allergenes: "peanuts",
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("status", 201);
          expect(res.body).to.have.property(
            "message",
            "Meal created successfully"
          );
          expect(res.body.data).to.include({
            name: "Vegetarian Curry",
            description:
              "A delicious curry made with fresh vegetables and spices.",
            isActive: true,
            isVega: true,
            isVegan: false,
            isToTakeHome: true,
            maxAmountOfParticipants: 10,
            price: 9.5,
            imageUrl: "https://example.com/vegetarian-curry.jpg",
            allergenes: "peanuts",
            cookId: cookId,
          });
          done();
        });
    });
  });

  describe("UC-303: Retrieve all meals", () => {
    it("should retrieve all meals successfully", (done) => {
      request(server)
        .get("/api/meal")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("status", 200);
          expect(res.body).to.have.property(
            "message",
            "All meals retrieved successfully"
          );
          expect(res.body.data).to.be.an("array");
          done();
        });
    });
  });

  describe("UC-305: Delete a meal", () => {
    it("should delete a meal successfully", (done) => {
      request(server)
        .delete("/api/meal/1")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("status", 200);
          expect(res.body).to.have.property(
            "message",
            "Meal with ID 1 deleted successfully"
          );
          done();
        });
    });
  });
  //
});
