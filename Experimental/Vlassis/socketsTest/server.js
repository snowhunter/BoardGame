var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var request, response;

app.get('/', function(req, res){
    request = req;
    response = res;
    res.sendFile(__dirname + '/index.html');
});

app.get('/game', function (req, res) {
    request = req;
    response = res;
    res.sendFile(__dirname + '/game.html');
});

//data structure that monitors the flow of all available games
var games = {
    game_IDs: [],
    active_games: 0
};

io.on('connection', function (socket) {
    console.log("a new user connected");
    console.log(socket.id);

    socket.on('join', function (data) {
        socket.emit('join-data', games);
    });

    socket.on('host', function () {
        //creating a game object and adding the host's id to the game_IDs
        games.game_IDs.push(socket.id);
        games[socket.id] = {};
        games[socket.id]["player1"] = socket.id;
        socket.emit('host-data', socket.id);
    });

    socket.on('game-select', function (data) {
        /**setting up the object:
         * socketID1 or socketID2 ->{
         *      "player1": socketID1,
         *      "player2": socketID2,
         *      identifier: "gameN"
         * }
         */
        games[data]["player2"] = socket.id;
        //making sure that both socket IDs point to the same game object
        games[socket.id]  = games[data];
        //incrementing the active games variable, and setting the room identifier
        games[data].identifier = "game" + (games.active_games + 1);
        games.active_games++;
        //The 2 sockets corresponding to the players join the same room
        io.sockets.connected[data].join(games[data].identifier);
        io.sockets.connected[socket.id].join(games[socket.id].identifier);
        //The redirect event is emitted for just the sockets of the same room
        io.to(games[socket.id].identifier).emit('redirect', 'game');
    });

    socket.on('disconnect', function () {
        console.log("a user has disconnected");
        /*let i = games.game_IDs.indexOf(socket.id);
        if(i>0){
            games.splice(i,1);
        }*/
    });

});

http.listen(4000, function () {
    console.log("listening on port 4000");
});
