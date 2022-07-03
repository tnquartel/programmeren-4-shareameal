process.env.DB_DATABASE = process.env.DB_DATABASE || "shareameal";
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
  '(46, "John", "Doe", "j.doe@server.com", "test", "test", "test", false);';
const INSERT_MEAL_JOHN_DOE =
  "INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `name`, `description`, `allergenes`, `dateTime`) VALUES (1, '0', '0', '0', '1', '6', '10', '', '46', 'Koekjes', 'Thomas eet graag dikke koeken', '', '1000-01-01 00:00:00')";
const INSERT_JOHN_DOE_MEAL_PARTICIPATE =
  "INSERT INTO meal_participants_user (mealId, userId) VALUES (1, 46) ";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ2LCJpYXQiOjE2NTY4NzQ1MTcsImV4cCI6MTY1NzkxMTMxN30.DvTLihHeLOwnis92OSOgyqvDsGIvpMd-wYKuc-QC0qg";

chai.should();
chai.use(chaiHttp);

describe("UC participation", () => {
  describe("UC-401 Aanmelden voor maaltijd", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-401-1 Niet ingelogd", (done) => {
      chai
        .request(server)
        .get("/api/meal/1/participate")
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
    it("TC-401-2 Maaltijd bestaat niet", (done) => {
      chai
        .request(server)
        .get("/api/meal/1/participate")
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
    it("TC-401-3 Succesvol aangemeld", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          chai
            .request(server)
            .get("/api/meal/1/participate")
            .set({ Authorization: `Bearer ${token}` })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              status.should.equals(200);
              result.currentlyParticipating.should.be
                .a("boolean")
                .that.equals(true);
              done();
            });
        });
      });
    });
  });
  describe("UC-402 Afmelden voor maaltijd", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-402-1 Niet ingelogd", (done) => {
      pool.query(INSERT_JOHN_DOE_MEAL_PARTICIPATE, () => {
        pool.query(INSERT_JOHN_DOE, () => {
          pool.query(INSERT_MEAL_JOHN_DOE, () => {
            chai
              .request(server)
              .get("/api/meal/1/participate")
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
      });
    });
    it("TC-402-2 Maaltijd bestaat niet", (done) => {
      pool.query(INSERT_JOHN_DOE_MEAL_PARTICIPATE, () => {
        pool.query(INSERT_JOHN_DOE, () => {
          pool.query(INSERT_MEAL_JOHN_DOE, () => {
            chai
              .request(server)
              .get("/api/meal/23/participate")
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
        });
      });
    });
    it("TC-402-3 Succesvol afgemeld", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_MEAL_JOHN_DOE, () => {
          pool.query(INSERT_JOHN_DOE_MEAL_PARTICIPATE, () => {
            chai
              .request(server)
              .get("/api/meal/1/participate")
              .set({ Authorization: `Bearer ${token}` })
              .end((req, res) => {
                res.should.be.an("object");
                let { status, result } = res.body;
                status.should.equals(200);
                result.currentlyParticipating.should.be
                  .a("boolean")
                  .that.equals(false);
                done();
              });
          });
        });
      });
    });
  });
});
