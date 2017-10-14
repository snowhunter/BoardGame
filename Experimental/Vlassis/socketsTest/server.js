var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var games = {
    game_IDs: []
};

io.on('connection', function (socket) {
    console.log("a new user connected");
    console.log(socket.id);

    socket.on('join', function (data) {
        socket.emit('join-data', games);
    });

    socket.on('host', function () {
        games.game_IDs.push(socket.id);
        games[socket.id] = {};
        games[socket.id]["player1"] = socket.id;
        socket.emit('host-data', socket.id);
    });

    socket.on('game-select', function (data) {
        games[data]["player2"] = socket.id;
        games[socket.id]  = games[data];
    });

    socket.on('disconnect', function () {
        console.log("a user has disconnected");
        let i = games.game_IDs.indexOf(socket.id);
        if(i>0){
            games.splice(i,1);
        }
    });

});

http.listen(4000, function () {
    console.log("listening on port 4000");
});
