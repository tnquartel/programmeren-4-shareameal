process.env.DB_DATABASE = process.env.DB_DATABASE || "shareamealtestdb";
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
const pool = require("../../src/database/dbconnection");

//Clear database sql
const CLEAR_MEAL_TABLE = "DELETE IGNORE FROM `meal`;";
const CLEAR_PARTICIPANTS_TABLE = "DELETE IGNORE FROM `meal_participants_user`;";
const CLEAR_USERS_TABLE = "DELETE IGNORE FROM `user`;";
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

const INSERT_USER_1 =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES" +
  '(1, "first", "last", "d.ambesi@avans.nl", "secret", "street", "city");';

const INSERT_USER_2 =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `isActive` ) VALUES" +
  '(2, "test", "test", "test@server.com", "test", "test", "test", true);';

const INSERT_JOHN_DOE =
  "INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `isActive` ) VALUES" +
  '(343, "John", "Doe", "j.doe@server.com", "test", "test", "test", false);';

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM0MywiaWF0IjoxNjUyNzc3OTI3LCJleHAiOjE2NTM4MTQ3Mjd9.lOehNhgPJlTzvZVWvvsCNob4mtkjfRsF5UIv6cCIRIQ";

chai.should();
chai.use(chaiHttp);

describe("TC-User", () => {
  describe("UC-101 Login", () => {
    it("TC-101-1 Verplicht veld ontbreekt", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ emailAdress: "test@mail.com" })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("password must be a string.");
          done();
        });
    });
    it("TC-101-2 Niet-valide email adres", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ emailAdress: "nietvalideemail", password: "secret" })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("EmailAdress is not valid");
          done();
        });
    });
    it("TC-101-3 Niet-valide wachtwoord", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ emailAdress: "test@mail.com", password: 123 })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("password must be a string.");
          done();
        });
    });
    it("TC-101-4 Gebruiker bestaat niet", (done) => {
      chai
        .request(server)
        .post("/api/auth/login")
        .send({ emailAdress: "test@mail.com", password: "secret" })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a("string")
            .that.equals("User not found or password invalid");
          done();
        });
    });
    it("TC-101-5 Gebruiker succesvol ingelogd", (done) => {
      pool.query(INSERT_USER_1, (err, dbresult, fields) => {
        chai
          .request(server)
          .post("/api/auth/login")
          .send({ emailAdress: "d.ambesi@avans.nl", password: "secret" })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, results } = res.body;
            status.should.equals(200);
            results.firstName.should.be.a("string").that.equals("first");
            done();
          });
      });
    });
  });
  describe("UC-201 Registreren als nieuwe gebruiker", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-201-1 When a required input is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Test",
          lastName: "Tophoven",
          emailAdress: "test",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Street must be a string");
          done();
        });
    });
    it("TC-201-2 When a emailadress is not valid, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Test",
          lastName: "Tophoven",
          //Will be checked!
          emailAdress: "nietvalidemail",
          street: "street",
          city: "city",
          phoneNumber: "123456789",
          password: "wachtwoord",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("EmailAdress is not valid");
          done();
        });
    });
    it("TC-201-3 When a password is not valid, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Test",
          lastName: "Tophoven",
          emailAdress: "nietvalidemail",
          street: "street",
          city: "city",
          phoneNumber: "123456789",
          //Will be checked!
          password: 123,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("Password must a string");
          done();
        });
    });
    it("TC-201-4 When a user already exists with the same email, a valid error should be returned", (done) => {
      pool.query(INSERT_USER_1, (err, result, fields) => {
        chai
          .request(server)
          .post("/api/user")
          .send({
            firstName: "Test",
            lastName: "Tophoven",
            emailAdress: "d.ambesi@avans.nl",
            street: "street",
            city: "city",
            phoneNumber: "123456789",
            //Will be checked!
            password: "123coolwachtwoord",
          })
          .end((err, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(409);
            message.should.be
              .a("string")
              .that.equals("User has not been added");
            done();
          });
      });
    });
    it("TC-201-5 When a user is succesfully added, a valid response should be returned", (done) => {
      const user = {
        firstName: "Test",
        lastName: "Tophoven",
        emailAdress: "test@mail.com",
        password: "wachtwoord",
        isActive: 1,
        phoneNumber: "01234567",
        roles: "editor",
        street: "street",
        city: "stad",
      };
      chai
        .request(server)
        .post("/api/user")
        .send(user)
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(201);
          result.firstName.should.be.a("string").that.equals(user.firstName);
          done();
        });
    });
  });
  describe("UC-202 Overzicht van gebruikers", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-202-1 Toon nul gebruikers", (done) => {
      chai
        .request(server)
        .get("/api/user")
        .set({ Authorization: `Bearer ${token}` })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          result.should.be.an("array").to.eql([]);
          status.should.equals(200);
          done();
        });
    });
    it("TC-202-2 Toon twee gebruikers", (done) => {
      pool.query(INSERT_USER_1, () => {
        pool.query(INSERT_USER_2, () => {
          chai
            .request(server)
            .get("/api/user")
            .set({ Authorization: `Bearer ${token}` })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              const amount = result.length;
              amount.should.equals(2);
              status.should.equals(200);
              done();
            });
        });
      });
    });
    it("TC-202-3 Toon gebruikers met zoekterm op niet-bestaande naam", (done) => {
      pool.query(INSERT_USER_2, () => {
        chai
          .request(server)
          .get("/api/user?firstName=nietbestaand")
          .set({ Authorization: `Bearer ${token}` })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, result } = res.body;
            const amount = result.length;
            amount.should.equals(0);
            status.should.equals(200);
            done();
          });
      });
    });
    it("TC-202-4 Toon gebruikers met gebruik van de zoekterm op het veld isActive=false", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_USER_2, () => {
          chai
            .request(server)
            .get("/api/user?isActive=false")
            .set({ Authorization: `Bearer ${token}` })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              const amount = result.length;
              amount.should.equals(1);
              status.should.equals(200);
              done();
            });
        });
      });
    });
    it("TC-202-5 Toon gebruikers met gebruik van de zoekterm op het veld isActive=true", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_USER_2, () => {
          chai
            .request(server)
            .get("/api/user?isActive=true")
            .set({ Authorization: `Bearer ${token}` })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              const amount = result.length;
              amount.should.equals(1);
              status.should.equals(200);
              done();
            });
        });
      });
    });
    it("TC-202-6 Toon gebruikers met zoekterm op bestaande naam", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_USER_2, () => {
          chai
            .request(server)
            .get("/api/user?firstName=John")
            .set({ Authorization: `Bearer ${token}` })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, result } = res.body;
              const amount = result.length;
              amount.should.equals(1);
              status.should.equals(200);
              done();
            });
        });
      });
    });
  });
  describe("UC-203 Gebruikersprofiel opvragen", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-203-1 Ongeldig token", (done) => {
      chai
        .request(server)
        .get("/api/user/profile")
        .set({ Authorization: `Bearer 2q3098yrhjswdgfo9usadyrwe9rweq9r` })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          console.log(message);
          message.should.be.a("string").that.equals("Not authorized");
          status.should.equals(401);
          done();
        });
    });
    it("TC-203-2 Valide token en gebruiker bestaat", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        pool.query(INSERT_USER_2, () => {
          chai
            .request(server)
            .get("/api/user/profile")
            .set({ Authorization: `Bearer ${token}` })
            .end((req, res) => {
              res.should.be.an("object");
              let { status, results } = res.body;
              results[0].firstName.should.be.a("string").that.equals("John");
              status.should.equals(200);
              done();
            });
        });
      });
    });
  });
  describe("UC-204 Details van gebruiker", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-204-1 Ongeldig token", (done) => {
      pool.query(INSERT_USER_2, () => {
        chai
          .request(server)
          .get("/api/user/1000")
          .set({ Authorization: `Bearer 2983yhroiuwseoy789rweqor` })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(401);
            message.should.be.a("string").that.equals("Not authorized");
            done();
          });
      });
    });
    it("TC-204-2 Gebruiker-ID bestaat niet", (done) => {
      chai
        .request(server)
        .get("/api/user/1000")
        .set({ Authorization: `Bearer ${token}` })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(404);
          message.should.be
            .a("string")
            .that.equals("User with provided Id does not exist");
          done();
        });
    });
    it("TC-204-3 Gebruiker-ID bestaat", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        chai
          .request(server)
          .get("/api/user/343")
          .set({ Authorization: `Bearer ${token}` })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, result } = res.body;
            status.should.equals(200);
            done();
          });
      });
    });
  });
  describe("UC-205 Gebruiker wijzigen", () => {
    afterEach((done) => {
      pool.query(CLEAR_DB, (err, result, fields) => {
        done();
      });
    });
    it("TC-205-1 Verplicht veld “emailAdress” ontbreekt", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        chai
          .request(server)
          .put("/api/user/343")
          .send({
            firstName: "Test",
            lastName: "Tophoven",
            password: "wachtwoord",
            isActive: 1,
            phoneNumber: "012345678",
            roles: "editor",
            street: "street",
            city: "stad",
          })
          .set({ Authorization: `Bearer ${token}` })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(400);
            message.should.be
              .a("string")
              .that.equals("EmailAddress must be a string");
            done();
          });
      });
    });
    it("TC-205-3 Niet-valide telefoonnummer", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        chai
          .request(server)
          .put("/api/user/343")
          .send({
            firstName: "Test",
            lastName: "Tophoven",
            emailAdress: "test@mail.com",
            password: "wachtwoord",
            isActive: 1,
            phoneNumber: "0123",
            roles: "editor",
            street: "street",
            city: "stad",
          })
          .set({ Authorization: `Bearer ${token}` })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(400);
            message.should.be
              .a("string")
              .that.equals(
                "Length of a phone number can only be between 8 and 11"
              );
            done();
          });
      });
    });
    it("TC-205-4 Gebruiker bestaat niet", (done) => {
      chai
        .request(server)
        .put("/api/user/343")
        .send({
          firstName: "Test",
          lastName: "Tophoven",
          emailAdress: "test@mail.com",
          password: "wachtwoord",
          isActive: 1,
          phoneNumber: "0123456789",
          roles: "editor",
          street: "street",
          city: "stad",
        })
        .set({ Authorization: `Bearer ${token}` })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be
            .a("string")
            .that.equals("User with provided id does not exist");
          done();
        });
    });
    it("TC-205-5 Niet ingelogd", (done) => {
      chai
        .request(server)
        .put("/api/user/343")
        .send({
          firstName: "Test",
          lastName: "Tophoven",
          emailAdress: "test@mail.com",
          password: "wachtwoord",
          isActive: 1,
          phoneNumber: "0123456789",
          roles: "editor",
          street: "street",
          city: "stad",
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
    it("TC-205-6 Gebruiker succesvol gewijzigd", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        chai
          .request(server)
          .put("/api/user/343")
          .send({
            firstName: "Test",
            lastName: "Tophoven",
            emailAdress: "test@mail.com",
            password: "wachtwoord",
            isActive: 1,
            phoneNumber: "0123456789",
            roles: "editor",
            street: "street",
            city: "stad",
          })
          .set({ Authorization: `Bearer ${token}` })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, result } = res.body;
            status.should.equals(200);
            result.should.be.a("string").that.equals("Succusful update!");
            done();
          });
      });
    });
  });
  describe("UC-206 Gebruiker verwijderen", () => {
    it("TC-206-1 Gebruiker bestaat niet", (done) => {
      chai
        .request(server)
        .delete("/api/user/343")
        .set({ Authorization: `Bearer ${token}` })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(400);
          message.should.be.a("string").that.equals("User does not exist");
          done();
        });
    });
    it("TC-206-2 Niet ingelogd", (done) => {
      chai
        .request(server)
        .delete("/api/user/343")
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
    it("TC-206-3 Actor is geen eigenaar", (done) => {
      chai
        .request(server)
        .delete("/api/user/343")
        .set({
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImlhdCI6MTY1MzA0NDM2NSwiZXhwIjoxNjU0MDgxMTY1fQ.BKKfJCqzDzgvqP8t3Ua7ZN8exCygM9rFUchKKE-l52g`,
        })
        .end((req, res) => {
          res.should.be.an("object");
          let { status, message } = res.body;
          status.should.equals(403);
          message.should.be
            .a("string")
            .that.equals("You cannot delete an account that is not yours!");
          done();
        });
    });
    it("TC-206-4 Gebruiker succesvol verwijderd", (done) => {
      pool.query(INSERT_JOHN_DOE, () => {
        chai
          .request(server)
          .delete("/api/user/343")
          .set({
            Authorization: `Bearer ${token}`,
          })
          .end((req, res) => {
            res.should.be.an("object");
            let { status, message } = res.body;
            status.should.equals(200);
            message.should.be.a("string").that.equals("Succesful deletion");
            done();
          });
      });
    });
  });
});
