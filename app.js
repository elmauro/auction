const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');

const index = require('./routes/index');
const users = require('./routes/users');

const logic = require('./controllers/logic');
const UserCtrl = require('./controllers/users');

const socket_io = require('socket.io');
const db = require('./models');
const api = require('./routes/api');
const app = express();
const io = socket_io();
let currentAuction = {};
let winner = {};
const usersConnected = {};
let counter = 3;

const DBCountdown = setInterval(() => {
  counter--;

  if (counter === -1) {
    db.sequelize.sync().then(() => {
      console.log('Connection has been established successfully.');
    }).catch((e) => {
      throw new Error(e);
    });
    clearInterval(DBCountdown);
  }
}, 1000);

app.io = io;

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('Auction', (scope) => {
    logic.scope = scope;
    logic.scope.currentAuction = scope.currentAuction;
    logic.scope.auction = scope.auction;
    logic.scope.auction.time = 10;

    UserCtrl.getUser(scope, (response) => {
      const user = response[0];

      scope.inventory = [
        { name: 'breads', quantity: user.breads, image: 'images/bread.jpg' },
        { name: 'carrots', quantity: user.carrots, image: 'images/carrot.png' },
        { name: 'diamond', quantity: user.diamond, image: 'images/diamond.jpg' }
      ];

      logic.scope.selectedItem = scope.inventory[scope.auction.selectedIndex];

      if (logic.validateAuction()) {
        counter = logic.scope.auction.time;
        const WinnerCountdown = setInterval(() => {
          io.emit('counter', counter);
          counter--;

          if (counter < 0) {
            console.log('Auction ended! ', winner);

            if (winner.username) {
              UserCtrl.updateSeller(scope, scope.currentAuction.sellerId, () => {
                UserCtrl.updateBuyer(scope, scope.winner.id, () => {
                  io.emit('winner', winner);

                  clearInterval(WinnerCountdown);
                  currentAuction = {};
                  winner = {};
                });
              });
            }
          }
        }, 1000);

        currentAuction = scope.auction;
        io.emit('currentAuction', { message: '', valid: true, currentAuction, toggle: true });
      } else {
        io.emit('currentAuction', {
          message: logic.scope.errorMessage,
          valid: false,
          currentAuction: undefined,
          toggle: false });
      }
    });
  });

  socket.on('placeBid', (scope) => {
    logic.scope.user = scope.user;
    logic.scope.currentAuction = currentAuction;
    logic.scope.winner = scope.winner;

    if (logic.validateBid()) {
      if (counter < 10) {
        counter = 10;
      }
      winner = scope.winner;
      io.emit('currentBid', { message: '', valid: true, winner });
    } else {
      io.emit('currentBid', { message: logic.scope.bidErrorMessage, valid: false, winner: undefined });
    }
  });

  socket.on('clearWinningMessage', () => {
    io.emit('clearMessage');
  });

  socket.on('getCurrentAuction', () => {
    if (currentAuction.sellerId) {
      io.emit('currentAuction', { message: '', valid: true, currentAuction, toggle: false });
      if (counter) {
        io.emit('counter', counter);
      }
    }
  });

  socket.on('disconnectExistingUser', (userConnection) => {
    const userInfo = usersConnected[userConnection.username];

    if (userInfo && userInfo.socket) {
      socket.to(userInfo.socket).emit('disconnectUser');
      userConnection.socket = socket.id;
      usersConnected[userConnection.username] = userConnection;
    } else {
      userConnection.socket = socket.id;
      usersConnected[userConnection.username] = userConnection;
    }
  });
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('swig').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', api);
app.use('/api/users', users);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
