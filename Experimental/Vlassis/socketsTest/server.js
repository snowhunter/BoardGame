var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use(express.static('C:/Users/Vlassis/Desktop/project hexagon/javascript/test/Main/socketsTest/'));

const tileIcons = './Graphics/TileIcons.png';
const spritesheet = './Graphics/spritesheet.png';

//base64 encoding the 2 sprite sheets
var data1 = fs.readFileSync(tileIcons).toString('base64');
var data2 = fs.readFileSync(spritesheet).toString('base64');


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
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
        socket.emit('join-data', {games: games, tileIcons: data1, spritesheet: data2});
    });

    socket.on('host', function (data) {
        //creating a game object and adding the host's id to the game_IDs
        console.log("host id: ");
        console.log(data.id);
        games.game_IDs.push(data.id);
        games[data.id] = {};
        games[data.id]["player1"] = data.id;
        console.log("active games: " + games.game_IDs.length);
        socket.emit('host-data', {id: data.id, tileIcons: data1, spritesheet: data2});
    });

    //the guest has selected a game to join, he creates the map, the map is transferred to the server
    //the game object is updated, the 2 socket objects representing the players, join a room with a unique room identifier
    socket.on('game-select', function (data) {
        /**setting up the object:
         * socketID1 or socketID2 ->{
         *      "player1": socketID1,
         *      "player2": socketID2,
         *      identifier: "gameN",
         *      map: hexmap,
         *      turns: 0,
         *      now_playing: socket_id1 or 2
         * }
         */
        games[data.id]["player2"] = socket.id;

        //making sure that both socket IDs point to the same game object
        games[socket.id]  = games[data.id];

        //setting the map
        games[data.id].map = data.hexmap;

        //incrementing the active games variable, and setting the room identifier
        games[data.id].identifier = "game" + (games.active_games + 1);
        games.active_games++;

        //initializing the turn counter
        games[data.id].turns = 0;

        //The 2 sockets corresponding to the players join the same room
        io.sockets.connected[data.id].join(games[data.id].identifier);
        io.sockets.connected[socket.id].join(games[socket.id].identifier);



        //The redirect event is emitted for just the sockets of the same room
        io.to(games[socket.id].identifier).emit('start-game', {
            map: data.hexmap
        });

    });

    //triggered whenever a player ends his turn. A game object is passed around to the players
    //and the gameloop sets up the map according to the game object information.
    socket.on('turn', function (data) {
        games[data.id].turns ++;
        io.to(games[socket.id].identifier).emit('turn', data);
    });

    socket.on('disconnect', function () {
        console.log("a user has disconnected");
        delete games[socket.id];
        games.game_IDs.splice(games.game_IDs.indexOf(socket.id),1);
        console.log("active games: " + games.game_IDs.length);

    });

});

http.listen(4000, function () {
    console.log("listening on port 4000");
});
