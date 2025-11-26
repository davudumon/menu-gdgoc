const express = require('express');
const router = express.Router();

const menuRoutes = require('./menuRoutes');

router.use('/menu', menuRoutes);

module.exports = router;
