const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
let database = [];

chai.should();
chai.use(chaiHttp);

describe("Manage users", () => {
  describe("UC-201 add user /api/user", () => {
    beforeEach((done) => {
      database = [];
      done();
    });
    it("When a required input is missing, a valid error should be returned", (done) => {
      chai
        .request(server)
        .post("/api/user")
        .send({
          firstName: "Thomas",
          lastName: "Quartel",
          //email addres ontbreekt
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
});
