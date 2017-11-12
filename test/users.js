process.env.NODE_ENV = 'test';

const common = require('./common');

// Require the dev-dependencies
const expect = require('chai').expect;
const request = require('request');

function expected(error, response) {
  const body = JSON.parse(response.body);

  expect(error).to.be.null;
  expect(response.statusCode).to.equal(200);
  expect(body).to.be.an('array');
  expect(body).to.have.lengthOf(1);
}

// Our parent block
describe('Users', () => {
  before((done) => {
    common.mock();
    done();
  });

  /*
  * Test the /GET route
  */
  describe('/GET users', () => {
    const url = 'https://localhost:8080/api/users/';

    it('it should GET all the users', (done) => {
      request(url, (error, response) => {
        expected(error, response);
        done();
      });
    });
  });

  describe('/POST user', () => {
    const url = 'https://localhost:8080/api/users/';

    it('it should POST an user', (done) => {
      request.post(url, (error, response) => {
        const body = JSON.parse(response.body);

        expect(error).to.be.null;
        expect(response.statusCode).to.equal(200);
        expect(body).to.be.an('object');
        done();
      });
    });
  });

  describe('/GET/:/username/:username user', () => {
    const url = 'https://localhost:8080/api/users/username/elalejo';

    it('it should GET an user by the given username', (done) => {
      request(url, (error, response) => {
        expected(error, response);
        done();
      });
    });
  });

  describe('/PUT/:id book', () => {
    const url = 'https://localhost:8080/api/users/be6b43b8-87c1-4a64-a112-9d69b63c9ff1';

    it('it should UPDATE an user given the id', (done) => {
      request.put(url, (error, response) => {
        const body = JSON.parse(response.body);

        expect(error).to.be.null;
        expect(response.statusCode).to.equal(200);
        expect(body).to.have.lengthOf(1);
        done();
      });
    });
  });
});
