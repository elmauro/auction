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
  User.findAll({
    where: {
      username: req.params.username,
    },
  }).then((users) => {
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
