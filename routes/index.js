const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

exports.index = (req, res) => {
  res.render('index', { title: 'Page title' });
};

module.exports = router;
