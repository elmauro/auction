const models = require('../models');
const User = models.User;

exports.allUsers = (req, res) => {
  User.findAll()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

exports.addUser = (req, res) => {
  models.User.create({
    username: req.body.username,
    coins: req.body.coins,
    breads: req.body.breads,
    carrots: req.body.carrots,
    diamond: req.body.diamond,
  }).then((newUser) => {
    res.status(200).json(newUser);
  }).catch((error) => {
    res.status(500).json(error);
  });
};

exports.findUser = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

exports.findUserByUsername = (req, res) => {
  const users = [];
  const user = {
    username: '',
    coins: 0,
    breads: 0,
    carrots: 0,
    diamond: 0,
  };

  User.findAll({
    where: {
      username: req.params.username,
    },
  }).then((_user) => {
    user.username = _user[0].dataValues.username;
    user.coins = _user[0].dataValues.coins;
    user.breads = _user[0].dataValues.breads;
    user.carrots = _user[0].dataValues.carrots;
    user.diamond = _user[0].dataValues.diamond;
    users.push(user);

    res.status(200).json(users);
  }).catch((error) => {
    res.status(500).json(error);
  });
};

exports.updateUser = (req, res) => {
  User.update(req.body, {
    where: {
      id: req.params.id,
    },
  }).then((updatedRecords) => {
    res.status(200).json(updatedRecords);
  }).catch((error) => {
    res.status(500).json(error);
  });
};

exports.deleteUser = (req, res) => {
  User.destroy({
    where: {
      id: req.params.id,
    },
  }).then((deletedRecords) => {
    res.status(200).json(deletedRecords);
  }).catch((error) => {
    res.status(500).json(error);
  });
};

exports.updateSeller = (scope, _id, callback) => {
  const name = scope.currentAuction.name;
  const quantity = scope.currentAuction.quantity;

  User.update({
    username: scope.currentAuction.seller,
    coins: scope.currentAuction.user.coins + scope.winner.bid,
    breads: name === 'breads' ? scope.currentAuction.user.breads - quantity : scope.currentAuction.user.breads,
    carrots: name === 'carrots' ? scope.currentAuction.user.carrots - quantity : scope.currentAuction.user.carrots,
    diamond: name === 'diamond' ? scope.currentAuction.user.diamond - quantity : scope.currentAuction.user.diamond,
  }, {
    where: {
      id: _id,
    },
  }).then(() => {
    callback();
  }).catch((error) => {
    console.log(error);
  });
};

exports.updateBuyer = (scope, _id, callback) => {
  const name = scope.currentAuction.name;
  const quantity = scope.currentAuction.quantity;

  User.update({
    username: scope.winner.username,
    coins: scope.winner.coins - scope.winner.bid,
    breads: name === 'breads' ? scope.winner.breads + quantity : scope.winner.breads,
    carrots: name === 'carrots' ? scope.winner.carrots + quantity : scope.winner.carrots,
    diamond: name === 'diamond' ? scope.winner.diamond + quantity : scope.winner.diamond,
  }, {
    where: {
      id: _id,
    },
  }).then(() => {
    callback();
  }).catch((error) => {
    console.log(error);
  });
};

exports.getUser = (scope, callback) => {
  User.findAll({
    where: {
      username: scope.currentAuction.user.username,
    },
  }).then((users) => {
    callback(users);
  }).catch((error) => {
    console.log(error);
  });
};
