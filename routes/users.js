const express = require('express');
const router = express.Router();
const UserCtrl = require('../controllers/users');

router.get('/', UserCtrl.allUsers);
router.post('/', UserCtrl.addUser);
router.get('/:id', UserCtrl.findUser);
router.get('/username/:username', UserCtrl.findUserByUsername);
router.put('/:id', UserCtrl.updateUser);
router.delete('/:id', UserCtrl.deleteUser);

module.exports = router;
