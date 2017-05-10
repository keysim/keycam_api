var config = {
    secret: 'keycam',
    port : 3333,
    socket_port : 4444,
    //url : ".com:" + 3000,
    //db : {url:'mongodb://keycam:keycam974@127.0.0.1:27017/keycam', port:27017, name:'keycam'},
    db : {url:'mongodb://keycam:keycam974@localhost:27017/keycam', port:27017, name:'keycam'},
    model:{
        user:{
            email: {type: String, required: true},
            password: {type: String, required: true}
        },
        group:{
            team:{type:String},
            name:{type:String},
            members:{type:Array},
            rating:{type:String}
        },
        team:{
            name:{type:String},
            img:{type:String},
            student_id:{type:String},
            role:{type: String}
        },
        log:{
            type:{type:String},
            message:{type:String},
            baby:{type:String},
            date: {type:Date, default:Date.now}
        }
    },
    mask : function (obj, tab) {
        var res = {};
        for (var key in tab)
            if(obj[key])
                res[key] = obj[key];
        return res;
    }
};

module.exports = config;