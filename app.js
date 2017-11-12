const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');  

const index = require('./routes/index');
const users = require('./routes/users');

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

  socket.on('Auction', (auction) => {
    counter = auction.time;
    const WinnerCountdown = setInterval(() => {
      io.emit('counter', counter);
      counter--;

      if (counter === -1) {
        console.log('Auction ended! ', winner);
        io.emit('winner', winner);
        clearInterval(WinnerCountdown);
        currentAuction = {};
        winner = {};
      }
    }, 1000);

    currentAuction = auction;
    io.emit('currentAuction', currentAuction);
  });

  socket.on('placeBid', (win) => {
    if (counter < 10) {
      counter = 10;
    }
    winner = win;
    io.emit('currentBid', winner);
  });

  socket.on('clearWinningMessage', () => {
    io.emit('clearMessage');
  });

  socket.on('getCurrentAuction', () => {
    if (currentAuction.sellerId) {
      io.emit('currentAuction', currentAuction);
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
