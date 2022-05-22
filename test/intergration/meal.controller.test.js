process.env.DB_DATABASE = process.env.DB_DATABASE || "shareamealtestdb";
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const pool = require("../../src/database/dbconnection");

const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_JOHN_DOE =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `isActive` ) VALUES" +
  '(343, "John", "Doe", "j.doe@server.com", "test", "test", "test", false);';
const INSERT_MEAL_JOHN_DOE =
  "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `name`, `description`, `allergenes`, `dateTime`) VALUES (1, '0', '0', '0', '1', '6', '10', '', '343', 'Test maaltijd', 'Dit is een test maaltijd', '', '1000-01-01 00:00:00')";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM0MywiaWF0IjoxNjUyNzc3OTI3LCJleHAiOjE2NTM4MTQ3Mjd9.lOehNhgPJlTzvZVWvvsCNob4mtkjfRsF5UIv6cCIRIQ";

chai.should();
chai.use(chaiHttp);

describe("UC meals", () => {
  describe("UC-301 Maaltijd aanmaken", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-301-1 Verplicht veld ontbreekt", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .send({
          description: " Thomas houdt van koekjes",
          price: 10,
        })
        .set({ Authorization: `Bearer ${token}` })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Name must be a string.");
          done();
        });
    });
    it("TC-301-2 Niet ingelogd", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .send({
          description: " Thomas houdt van koekjes",
          price: 10,
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    it("TC-301-3 Maaltijd succesvol toegevoegd", (done) => {
      chai
        .request(server)
        .post("/api/meal")
        .send({
          name: "Salade",
          description: "Mooie zomerse salade met veel groente",
          price: 3,
          maxAmountOfParticipants: 2,
          isActive: 1,
          isToTakeHome: 1,
          dateTime: "1000-01-01 00:00:00",
          imageUrl:
            "https://www.landleven.nl/getmedia/58639eae-3b6a-44db-b9ed-f417bb2859da/gemengde-salade-min.jpg?width=816&height=544&ext=.jpg",
          allergenes: "lactose",
          isVega: 1,
          isVegan: 0,
        })
        .set({ Authorization: `Bearer ${token}` })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(201);
          result.price.should.equals(3);
          done();
        });
    });
  });
  describe("UC-302 Maaltijd wijzigen", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-302-1 Verplicht velden “name” en/of “price”en/of “maxAmountOfParticipants” ontbreken", (done) => {
      pool.query(INSERT_MEAL_JOHN_DOE, () => {
        chai
          .request(server)
          .put("/api/meal/1")
          .send({
            description: "coole koek",
            price: 10,
            maxAmountOfParticipants: 1,
          })
          .set({ Authorization: `Bearer ${token}` })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(400);
            message.should.be.a("string").that.equals("Name must be a string.");
            done();
          });
      });
    });
    it("TC-302-2 Niet ingelogd", (done) => {
      pool.query(INSERT_MEAL_JOHN_DOE, () => {
        chai
          .request(server)
          .put("/api/meal/1")
          .send({
            name: "Salade",
            description: "Mooie zomerse salade met veel groente",
            price: 3,
            maxAmountOfParticipants: 2,
            isActive: 1,
            isToTakeHome: 1,
            imageUrl:
              "https://www.landleven.nl/getmedia/58639eae-3b6a-44db-b9ed-f417bb2859da/gemengde-salade-min.jpg?width=816&height=544&ext=.jpg",
            allergenes: "lactose",
            isVega: 1,
            isVegan: 0,
          })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(401);
            message.should.be
              .a("string")
              .that.equals("Authorization header missing!");
            done();
          });
      });
    });
    it("TC-302-3 Niet de eigenaar van de data", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .put("/api/meal/1")
            .send({
              name: "Salade",
              description: "Mooie zomerse salade met veel groente",
              price: 3,
              maxAmountOfParticipants: 2,
              isActive: 1,
              isToTakeHome: 1,
              imageUrl:
                "https://www.landleven.nl/getmedia/58639eae-3b6a-44db-b9ed-f417bb2859da/gemengde-salade-min.jpg?width=816&height=544&ext=.jpg",
              allergenes: "lactose",
              isVega: 1,
              isVegan: 0,
            })
            .set({
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTY1MzA1NTI5NSwiZXhwIjoxNjU0MDkyMDk1fQ.OKjPkj0LsoVzksiIHt1UcXzcLDohIs6gjU-C0N-9ROg`,
            })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, message } = res.body;
              status.should.equals(403);
              message.should.be
                .a("string")
                .that.equals("Cannot update a meal that is not yours!");
              done();
            });
        });
      });
    });
    it("TC-302-4 Maaltijd bestaat niet", (done) => {
      chai
        .request(server)
        .put("/api/meal/1")
        .send({
          name: "Salade",
          description: "Mooie zomerse salade met veel groente",
          price: 3,
          maxAmountOfParticipants: 2,
          isActive: 1,
          isToTakeHome: 1,
          imageUrl:
            "https://www.landleven.nl/getmedia/58639eae-3b6a-44db-b9ed-f417bb2859da/gemengde-salade-min.jpg?width=816&height=544&ext=.jpg",
          allergenes: "lactose",
          isVega: 1,
          isVegan: 0,
        })
        .set({ Authorization: `Bearer ${token}` })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a("string")
            .that.equals("Meal with provided id does not exist");
          done();
        });
    });
    it("TC-302-5 Maaltijd succesvol gewijzigd", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .put("/api/meal/1")
            .send({
              name: "Salade",
              description: "Mooie zomerse salade met veel groente",
              price: 3,
              maxAmountOfParticipants: 2,
              isActive: 1,
              isToTakeHome: 1,
              dateTime: "1000-01-01 00:00:00",
              imageUrl:
                "https://www.landleven.nl/getmedia/58639eae-3b6a-44db-b9ed-f417bb2859da/gemengde-salade-min.jpg?width=816&height=544&ext=.jpg",
              allergenes: "lactose",
              isVega: 1,
              isVegan: 0,
            })
            .set({ Authorization: `Bearer ${token}` })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, result, message } = res.body;
              status.should.equals(200);
              message.should.be.a("string").that.equals("Succusful update!");
              done();
            });
        });
      });
    });
  });
  describe("UC-303 Lijst van maaltijden opvragen", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("UC-303 Lijst van maaltijden opvragen", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .get("/api/meal/")
            .end((req, res) => {
              let { status, result } = res.body;
              const amount = result.length;
              status.should.equals(200);
              amount.should.equals(1);
              done();
            });
        });
      });
    });
  });
  describe("UC-304 Details van een maaltijd opvragen", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-304-2 Details van maaltijd geretourneerd", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .get("/api/meal/100000000")
            .end((req, res) => {
              let { status, message } = res.body;
              status.should.equals(404);
              message.should.be
                .a("string")
                .that.equals("meal with provided id does not exist");
              done();
            });
        });
      });
    });
    it("TC-304-2 Details van maaltijd geretourneerd", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .get("/api/meal/1")
            .end((req, res) => {
              let { status, result } = res.body;
              status.should.equals(200);
              result.id.should.equals(1);
              done();
            });
        });
      });
    });
  });
  describe("UC-305 Maaltijd verwijderen", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-305-2 Niet ingelogd", (done) => {
      chai
        .request(server)
        .delete("/api/user/1")
        .end((req, res) => {
          let { status, message } = res.body;
          status.should.equals(401);
          message.should.be
            .a("string")
            .that.equals("Authorization header missing!");
          done();
        });
    });
    it("TC-305-3 Niet de eigenaar van de data", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .delete("/api/meal/1")
            .set({
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTY1MzA1NTI5NSwiZXhwIjoxNjU0MDkyMDk1fQ.OKjPkj0LsoVzksiIHt1UcXzcLDohIs6gjU-C0N-9ROg`,
            })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, message } = res.body;
              status.should.equals(403);
              message.should.be
                .a("string")
                .that.equals(
                  "You are not the owner of this meal therefore you can't delete it"
                );
              done();
            });
        });
      });
    });
    it("TC-305-4 Maaltijd bestaat niet", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .delete("/api/meal/1000000")
            .set({
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTY1MzA1NTI5NSwiZXhwIjoxNjU0MDkyMDk1fQ.OKjPkj0LsoVzksiIHt1UcXzcLDohIs6gjU-C0N-9ROg`,
            })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, message } = res.body;
              status.should.equals(404);
              message.should.be
                .a("string")
                .that.equals("Meal with provided id does not exist");
              done();
            });
        });
      });
    });
    it("TC-305-5 Maaltijd succesvol verwijderd", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .delete("/api/meal/1")
            .set({
              Authorization: `Bearer ${token}`,
            })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(200);
              result.should.be.a("string").that.equals("Succusful deletion!");
              done();
            });
        });
      });
    });
  });
});
