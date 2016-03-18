var express = require('express');
var jwt = require('express-jwt');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser  = require('body-parser');
var methodOverride = require('method-override');

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

app.locals = require('./config.json');

app.all('',function(req,res,next){
    req.db = db;
    next();
});

app.get('/', function(req, res){
    var collection = db.get('msgs');
    collection.find({},{},function(e,docs){
        res.render('index',{msgs: docs,page: 'index'});
    });
});

app.all('/:page',function(req, res){
    var page = req.params.page;
    var result = require('./application/'+page)(req) || {};
    if (result.redirect){
        res.redirect(result.redirect);
    } else if (result.view) {
        res.render(result.view,result);
    } else if (result.json) {
        res.json(result.json);
    } else {
        res.render(page,{page: page});
    }
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
