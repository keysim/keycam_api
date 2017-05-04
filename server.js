// =================================================================
// KeyCam_API ======================================================
// =================================================================
'use strict';
var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var config		= require('./api/config');
var routes		= require('./api/router');

// =================================================================
// configuration ===================================================
// =================================================================

mongoose.connect(config.db.url, function(err) {
	if(!err)
		return console.log("Connected to MongoDB !");
    console.log("Unable to connect MongoDB.");
    process.exit();
});

app.set('superSecret', config.db.secret);
//app.use("/", express.static(__dirname + '/site'));
app.use("/node_modules", express.static(__dirname + '/node_modules'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(morgan('dev'));// Debug mode

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.options("/*", function(req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	res.send(200);
});

app.use('/api', routes);

app.listen(config.port);

console.log('API on ' + config.port);
