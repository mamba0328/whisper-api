import {Request, Response} from "express";

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req:Request, res:Response, next:CallableFunction) {
  res.send('respond with a resource');
});

module.exports = router;
