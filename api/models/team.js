var COLLECTION_NAME = "team";
var Collection	= require('./model')[COLLECTION_NAME];
var config		= require('../config');

module.exports = {

	getAll : function(req, res) {
		Collection.find({}, function(err, data) {
			if (err) {
				res.status(500).json({success: false, message:err});
				return console.error(err);
			}
			res.json(data);
		});
	},

	post : function(req, res) {
		var data = config.mask(req.body, config.model[COLLECTION_NAME]);
		var newOne = new Collection(data);
		newOne.save(function(err, data) {
			if (err) {
				res.status(500).json({success: false, message:err});
				return console.error(err);
			}
			res.status(201).json({success: true, message: COLLECTION_NAME + " created successfully", id:data.id});
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
			res.json({success: true, message: COLLECTION_NAME + ' deleted successfully' });
		});
	}
};