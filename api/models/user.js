var COLLECTION_NAME = "user";
var Collection		= require('./model')[COLLECTION_NAME];
var config			= require('../config');
var jwt				= require('jsonwebtoken');

module.exports = {

	// =================================================================
	// TOKEN VALIDATIONS ===============================================
	// =================================================================
	register : function(req, res) {
		Collection.findOne({
			email: req.body.email
		}, function(err, user) {
			if (err) {
				res.json({success: false, message:err});
				return console.error(err);
			}
			if (user) {
				res.status(400).json({ success: false, message: 'Registration failed. Login already taken.' });
			} else if (!user) {
				if(String(req.body.password).length < 6 || String(req.body.password).length > 20)
					res.status(400).json({ success: false, message: 'Password wrong. It have to be between 6 and 20 characters' });
				else {
					var data = config.mask(req.body, config.model[COLLECTION_NAME]);
					var newOne = new Collection(data);
					newOne.save(function(err, data) {
						if (err) {
							res.status(400).json({success: false, message:err});
							return console.error(err);
						}
						res.status(201).json({success: true, message: COLLECTION_NAME + " created successfully", id:data.id});
					});
				}
			}

		});
	},
	authenticate : function(req, res) {
		Collection.findOne({
			email: req.body.email
		}, function(err, user) {
			if (err) {
				res.status(400).json({success: false, message:err});
				return console.error(err);
			}
			if (!user) {
				res.status(400).json({ success: false, message: 'User not found.' });
			} else if (user) {
				if (user.password != req.body.password) {
					res.status(400).json({ success: false, message: 'Wrong password.' });
				} else {
					// create a token
					var token = jwt.sign(user, config.secret, {
						expiresIn: 86400 // expires in 24 hours
					});

					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token,
						id: user.id
					});
				}
			}
		});
	},
	// NOT A ROUTE JUST A MIDDLEWARE
	tokenMiddleware : function(req, res, next) {
		var token = (req.body && req.body.token) || req.params['token'] || (req.query && req.query.token) || req.headers['x-access-token'];
		if (!token)
			return res.status(403).send({success: false, message: 'Wrong url or No token provided.'});
		try {
			var decoded = jwt.decode(token, config.secret);
			Collection.findOne({
				email: decoded._doc.email
			}, function(err, user) {
				if(err || !user)
					return res.status(403).send({ success: false, message: 'Db error or token invalid.' });
				req.user = user;
				return next();
			});
		} catch (err) {
			return res.status(403).send({ success: false, message: 'Failed to authenticate token.' });
		}
	},

	getAll : function(req, res) {
		Collection.find({}, function(err, data) {
			if (err) {
				res.status(500).json({success: false, message:err});
				return console.error(err);
			}
			res.json(data);
		});
	},

	get : function(req, res) {
		Collection.findOne({
			_id: req.params.id
		}, function(err, data) {
			if (err) {
				res.status(500).json({success: false, message:err});
				return console.error(err);
			}
			if(!data)
				return res.status(404).json({success: false, message: COLLECTION_NAME + ' not found'});
			if(!req.user || req.user.id != data.id)
				delete data.password;
			res.json(data);
		});
	},

	put : function(req, res) {
		var data = config.mask(req.body, config.model[COLLECTION_NAME]);
		Collection.update({_id: req.params.id}, {$set : data}
			, function(err, data){
				if (err) {
					res.status(500).json({success: false, message:err});
					return console.error(err);
				}
				if(data.n === 0)
					return res.status(404).json({success: false, message: COLLECTION_NAME + ' not found'});
				else if(data.nModified === 0)
					return res.status(202).json({success: true, message: COLLECTION_NAME + ' unchanged'});
				res.json({success:true, message: COLLECTION_NAME + " " + req.params.id + " updated successfully"});
			});
	},

	delete : function(req, res) {
		Collection.remove({
			_id: req.params.id
		}, function(err) {
			if (err) {
				res.status(500).json({success: false, message:err});
				return console.error(err);
			}
			res.json({success: true, message: COLLECTION_NAME + ' deleted successfully'});
		});
	}
};