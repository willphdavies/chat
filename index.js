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

app.set('jwtSecret','here-is-my-secret-hahahahah');
app.use(
    jwt(
        {
            secret: app.get('jwtSecret'),
            credentialsRequired: false,
            getToken: function fromHeaderOrQuerystring (req) {
                if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                    return req.headers.authorization.split(' ')[1];
                } else if (req.query && req.query.token) {
                    return req.query.token;
                } else if ( req.cookie.token ){
                    return req.cookie.token;
                }
                return null;
            }
        }).unless({path: ['/login','/register']}));

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/chat');

app.locals = require('./config.json');

app.all('*',function(req,res,next){
    req.db = db;
    next();
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.redirect('/login');
    }
});

app.get('/', function(req, res){
    var collection = req.db.get('msgs');
    collection.find({},{},function(e,docs){
        res.render('index',{msgs: docs,page: 'index'});
    });
});

app.all('/:page',function(req, res){
    var page = req.params.page;
    var handler = require('./application/'+page)(app);

    console.log(res.render(page, {page: page}).find({},{},function(e,docs){
        console.log(docs);
    }));
    if (typeof handler[req.method.toLowerCase()] === 'function') {

        var success = function (response) {
            res.status(response.status ? response.status : 200);
            if (response.redirect) {
                res.redirect(response.redirect);
            } else if (response.view) {
                res.render(response.view, response);
            } else if (response.json) {
                res.json(response.json);
            } else {
                res.render(page, {page: page});
            }
        };

        var failure = function (response) {
            console.log('fail');
        };
        handler(req).then(success, failure);

    } else {
        res.render(page, {page: page});
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
