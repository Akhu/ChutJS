var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

server.listen('3000');
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile('index.html')
});

/**
  - Logo
  - Changer titre de la page
  - Bug absenteisme quand le socket se déconnecte
**/

var team = [];
io.on('connection', function (socket) {
  //console.log(socket);

  socket.on('connect', function(socket){

  })
  socket.on('login', function (data) {
    console.log(data);
    var user = {'username' : data.username, 'status' : data.status };
    socket.user = user;
    if(arrayObjectIndexOf(team, user.username, 'username') != -1){
        console.log('User : '+user.username+' already connected');
    }else{
        team.push(user);
    }

    console.log(team);
    var dataToSend = {'team' : team, 'me' : user };
    socket.emit('login done', dataToSend);
    io.emit('refreshTeam', team);
  });

  socket.on('disconnect', function(){
    if(typeof socket.user != 'undefined' ){
      indexOfUser = arrayObjectIndexOf(team, socket.user.username, 'username');
      team[indexOfUser].status = 'away';
      // console.log(indexOfUser);
      // team.splice(indexOfUser,1);
      io.emit('refreshTeam',team);
    }

  })


});

function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
    	//console.log(myArray[i]);
    	//console.log(myArray[i]);
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}
