const nock = require('nock');
const config = require('./config');

module.exports = {
  mock: () => {
    nock.disableNetConnect();

    nock(config.httpHost)
      .persist()
      .filteringPath(path => path.replace(/.*\/api\/users.*/, '/user'))
      .post('/user')
      .replyWithFile(200, `${__dirname}/fixtures/user.json`, { 'Content-Type': 'application/json' });

    nock(config.httpHost)
      .persist()
      .filteringPath(path => path.replace(/.*\/api\/users.*/, '/user'))
      .put('/user')
      .reply(200, [1], { 'Content-Type': 'application/json' });

    nock(config.httpHost)
      .persist()
      .filteringPath(path => path.replace(/.*\/api\/users.*/, '/users'))
      .get('/users')
      .replyWithFile(200, `${__dirname}/fixtures/users.json`, { 'Content-Type': 'application/json' });

    nock(config.httpHost)
      .persist()
      .filteringPath(path => path.replace(/.*\/api\/users\/username.*/, '/user'))
      .get('/user')
      .replyWithFile(200, `${__dirname}/fixtures/users.json`, { 'Content-Type': 'application/json' });
  },

  enableNetConnect() {
    nock.enableNetConnect();
    nock.cleanAll();
  },
};
