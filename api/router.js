var express 	= require('express');
var user        = require('./models/user');
var group       = require('./models/group');
var team        = require('./models/team');
var log         = require('./models/log');
var OpenTok		= require('opentok');
var sessionId   = null;
let tokboxTokenServ = 'db964962da51c507ef24dc9fb4ae4b3841df87c3';
var tokboxToken = "";
let key         = '45839072';
var opentok = new OpenTok(key, tokboxTokenServ);

opentok.createSession({mediaMode:'routed', archiveMode:'always'}, function(err, session) {
    if (err) {
        console.log("Error creating session:", err)
    } else {
        sessionId = session.sessionId;
        tokboxToken = opentok.generateToken(sessionId, {
            role :       'moderator',
            expireTime : (new Date().getTime() / 1000)+(7 * 24 * 60 * 60), // in one week
            data :       'name=Johnny'
        });
        console.log("Session ID: " + sessionId);
    }
});

function getSession(req, res) {
    res.json({success:true, message: "Here the tokbox session and token", token:tokboxToken, id:sessionId, key:key});
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