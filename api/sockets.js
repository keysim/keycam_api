var jwt				= require('jsonwebtoken');
var config		    = require('./config');
var validator       = require('validator');
const mailer        = require('nodemailer');
var COLLECTION_NAME = "log";
var Collection	= require('./models/model')[COLLECTION_NAME];
var babySockets = [];
var parentSockets = [];

class SocketHandler {
    constructor(io){
        this.io = io;
    }
    handshake(){
        var io = this.io;
        io.use(function(socket, next) {
            var token = socket.handshake.query.token;
            var type = socket.handshake.query.type;
            if(!token || !type || (type != "baby" && type != "parent")) {
                console.log("Socket refused : token or/and type missing");
                return null;
            }
            var decoded = jwt.decode(token, config.secret);
            if(!decoded){
                console.log("Socket refused : Token wrong");
                return null;
            }
            var email = decoded._doc.email;
            if(type == "baby") {
                if(babySockets[email] && io.sockets.connected[babySockets[email]])
                    io.sockets.connected[babySockets[email]].disconnect();
                babySockets[email] = socket.id;
            }
            else {
                if(parentSockets[email] && io.sockets.connected[parentSockets[email]])
                    io.sockets.connected[parentSockets[email]].disconnect();
                parentSockets[email] = socket.id;
            }
            socket.type = type;
            socket.email = email;
            return next();
        });
    }
    start(){
        var events = ['picture', 'text', 'switch', 'battery', 'playlist', 'player', 'light', 'mood', 'mode'];
        this.handshake();
        var io = this.io;
        io.on('connection', function(socket){
            if(socket.type == "parent")
                console.log("++++ Parent", socket.email, "connected ++++");
            else
                console.log("++++ Baby", socket.email, "connected ++++");
            if (babySockets[socket.email] && io.sockets.connected[babySockets[socket.email]] && parentSockets[socket.email] && io.sockets.connected[parentSockets[socket.email]])
                io.sockets.connected[parentSockets[socket.email]].emit('babyState', "on");
            else if(parentSockets[socket.email] && io.sockets.connected[parentSockets[socket.email]])
                io.sockets.connected[parentSockets[socket.email]].emit('babyState', "off");
            for (var event of events) {
                socket.on(event, function (data) {
                    if (this.type == "parent") {
                        console.log("-> Parent", this.email, "sent", data.type);
                        if (babySockets[this.email] && io.sockets.connected[babySockets[this.email]])
                            io.sockets.connected[babySockets[this.email]].emit(data.type, data.data);
                        else
                            console.log("<- but baby is not connected");
                    }
                    else {
                        console.log("<- Baby", this.email, "sent", data.type);
                        if (parentSockets[this.email] && io.sockets.connected[parentSockets[this.email]])
                            io.sockets.connected[parentSockets[this.email]].emit(data.type, data.data);
                        else{
                            var logData = config.mask({baby: this.email, type:data.type, message:data.data}, config.model[COLLECTION_NAME]);
                            var newOne = new Collection(logData);
                            newOne.save(function(err, logData) {
                                if (err)
                                    return console.error(err);
                                console.log("***New log saved from babyphone***", logData.baby)
                            });
                        }
                    }
                });
            }
            socket.on('disconnect', function (msg){
                if(this.type == "baby" && io.sockets.connected[parentSockets[this.email]])
                    io.sockets.connected[parentSockets[this.email]].emit('babyState', "off");
                else if(this.type == "baby" && this.email){
                    mailOptions.to = this.email;
                    if(validator.isEmail(this.email)) {
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error)
                                return console.log(error);
                            console.log('- Message %s sent: %s', info.messageId, info.response);
                        });
                    }
                    else
                        console.log("---- Sorry but", this.email, "is not a email ----")
                }
                if(socket.type == "parent")
                    console.log("++++ Parent", socket.email, "disconnect ++++");
                else
                    console.log("++++ Baby", socket.email, "disconnect ++++");
            });
        });
    }
}

// create reusable transporter object using the default SMTP transport
let transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bonjourtoto974@gmail.com',
        pass: 'bonjour974'
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"Babyphone" <simon@keysim.com>', // sender address
    to: 'keysim.fr@gmail.com', // list of receivers
    subject: 'The babyphone just disconnected', // Subject line
    text: 'The babyphone just disconnected !', // plain text body
    html: '<h2>The babyphone just disconnected</h2>' // html body
};

module.exports = SocketHandler;