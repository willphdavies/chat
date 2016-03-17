var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser  = require('body-parser');
var methodOverride = require('method-override');
var db = require('mongodb');

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.enable('etag');
app.use(express.static(path.join(__dirname, 'public')));

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/chat');

// Make our db accessible to our router
app.use(function(req,res,next){
    next();
});



app.get('/', function(req, res){
    var collection = db.get('msgs');
    collection.find({},{},function(e,docs){
        res.render('index',{msgs: docs});
    });
});

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        var collection = db.get('msgs');
        collection.insert(msg);
        io.emit('chat message', msg);
    });
});

http.listen(3001, function(){
    console.log('listening on *:3001');
});
