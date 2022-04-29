const chai = require("chai");
const chaiHttp = require("chai-http");
const { post } = require("../../index");
const server = require("../../index");
const { addUser } = require("../../src/controllers/user.controller");
let database = [];

chai.should();
chai.use(chaiHttp);

describe("Manage users", () => {
  describe("TC-201-1 add user /api/user", () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    it("When a required input is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          //first name ontbreekt,
          lastName: "Quartel",
          emailAdress: "thomasquartel@outlook.com",
          password: "password",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("First name must be a string");
          done();
        });
    });
  });
  describe("TC-201-2 add user /api/user", () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    it("When a invalid email address is entered, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Thomas",
          lastName: "Quartel",
          emailAdress: 100,
          password: "password",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals("Email address must be a string");
          done();
        });
    });
  });
  describe("TC-201-3 add user /api/user", () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    it("When a invalid password is entered, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Thomas",
          lastName: "Quartel",
          emailAdress: "thomasquartel@outlook.com",
          password: 100,
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be.a("string").that.equals("Password must be a string");
          done();
        });
    });
  });
  describe("TC-201-4 add user /api/user", () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    it("When a user that already exists is added, a valid error should be returned", (done) => {
      const user = {
        firstName: "Thomas",
        lastName: "Quartel",
        emailAdress: "thomasquartel@outlook.com",
        password: "password",
      };
      chai.request(server).post("/api/user").send(user).end();
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Thomas",
          lastName: "Quartel",
          emailAdress: "thomasquartel@outlook.com",
          password: "password",
        })
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(400);
          result.should.be
            .a("string")
            .that.equals(
              "User was not added to database, because the email address is already in use"
            );
          done();
        });
    });
  });
  describe("TC-201-5 add user /api/user", () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    it("When a new user is added, the user should be returend", (done) => {
      const user = {
        firstName: "Thomas",
        lastName: "Quartel",
        emailAdress: "testmail@mail.com",
        password: "password",
      };
      chai
        .request(server)
        .post("/api/user")
        .send(user)
        .end((err, res) => {
          res.should.be.an("object");
          let { status, result } = res.body;
          status.should.equals(200);
          result.firstName.should.equals(user.firstName);
          done();
        });
    });
  });
});
