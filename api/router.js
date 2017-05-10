var express 	= require('express');
var user        = require('./models/user');
var group       = require('./models/group');
var team        = require('./models/team');
var log         = require('./models/log');
var OpenTok		= require('opentok');
var sessionId     = null;
let tokboxToken = 'db964962da51c507ef24dc9fb4ae4b3841df87c3';
var opentok = new OpenTok('45839072', tokboxToken);

opentok.createSession(function(err, session) {
    if (err) return console.log(err);

    // save the sessionId
    sessionId = session.sessionId;
    //db.save('session', session.sessionId, done);
});

function getSession(req, res) {
    res.json({success:true, message: "Here the tokbox session and token", token:tokboxToken, id:sessionId});
}

var routes = express.Router();

routes.get("/",                 function (req, res) {
    res.json({"success":true, "message": "Welcome to the KeyCam API"});
});

routes.post("/register",        user.register);
routes.post("/authenticate",    user.authenticate);

routes.route("/groups")
    .get(group.getAll)
    .post(group.post);
routes.route("/groups/:id")
    .get(group.get)
    .put(group.put)
    .delete(group.delete);

routes.route("/teams")
    .get(team.getAll)
    .post(team.post);
routes.route("/teams/:id")
    .get(team.get)
    .put(team.put)
    .delete(team.delete);

routes.route("/logs")
    .get(log.getAll)
    .post(log.post);
routes.route("/logs/:id")
    .get(log.get)
    .put(log.put)
    .delete(log.delete);

routes.route("/video").get(getSession);

// =================================================================
// authenticated routes ============================================
// =================================================================
routes.use(user.tokenMiddleware);
routes.get("/", function(req, res) { res.json({message: 'Hi ' + req.user.login}); }); // Say hi to the authenticate user

routes.route("/users")
    .get(user.getAll);
routes.route("/users/:id")
    .get(user.get)
    .put(user.put)
    .delete(user.delete);


module.exports = routes;