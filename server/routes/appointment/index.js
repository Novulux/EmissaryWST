'use strict';

var express = require('express');
var controller = require('./appointment.controller');
var authController = require('../../config/auth');

var router = express.Router();

router.post('/', authController.isBearerAuthenticated, controller.template.create);
router.get('/:id', authController.isBearerAuthenticated, controller.template.get);
router.get('/company/:id', authController.isBearerAuthenticated, controller.template.getAll);
router.put('/:id', authController.isBearerAuthenticated, controller.template.update);
router.delete('/:id', authController.isBearerAuthenticated, controller.template.delete);

module.exports = router;
