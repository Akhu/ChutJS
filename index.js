var express = require('express');
var app = express();
var http = require('http');
var mongoose = require('mongoose');
var server = http.createServer(app);
var io = require('socket.io')(server);

server.listen('3000');

var Models;

var mongoose = require('mongoose');
var team = [];
mongoose.connect('mongodb://localhost/chutjs', function(err){
	if(err){
		console.log('failed to connect mongodb');
	}else{
		// ./model va chercher par défaut les fichiers index.js
		Models = require('./model')(mongoose);

    // var userTest = new Models.User({
    //   username : "Anthony",
    //   status : "free"
    // });
    // userTest.save(function(err){
      console.log('userSaved');
      Models.User.find({}, function(err, docs){
        if(err){
          console.log(err);
        }
        //console.log(docs);
        if(docs.length != -1){
          team = docs;
          console.log(team);
        }
      });
    //})
    //1. We fill team with already existing users

		console.log("Models created + Connected to MDB");
	}
});

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile('index.html')
});

/**
  - Logo
  - Changer titre de la page
  - Bug absenteisme quand le socket se déconnecte
**/


io.on('connection', function (socket) {


  socket.on('connect', function(socket){

  })

	socket.on('chut', function(data){
		 if(data.to == 'all'){

			 io.emit('chut',{to : 'all'});
		 }else{
			 console.log(io.clients);
		 }

		 Models.User.findOne({'username' :  data.me.username }, function(err,user){
			  if(err){
					console.log(err);
				}
				if(user != null){
					user.chutCount = user.chutCount - 1;
					user.save(function(err){
						if(err){ console.log(err) }
						socket.emit('me updated', user);
					})

				}

		 })


	})

  socket.on('login', function (data) {
    var user;
    console.log(data);

    //var user = {'username' : data.username, 'status' : data.status };
    //socket.user = user;
    Models.User.findOne({'username' : data.username }, function(err,user){
      if(err){
        console.log(err);
      }
      if(user != null){
        console.log('user already connected : '+data.username );
        user.connected = true;
        user.status = data.status;
        user.save(function(err){
          if(err){
            console.log(err);
          }
          updateUserInTeam(team,user);
          socket.emit('login done', user);
          io.emit('refreshTeam', team);
        })
      }else{
        var user = new Models.User({
          username : data.username,
          status : data.status,
          chutCount : 2,
          connected : true
        });
        user.save(function(err){
          team.push(user);
          socket.emit('login done', user);
          io.emit('refreshTeam', team);
        });
      }
    })

    console.log(team);
    console.log(socket.user);

  });

  socket.on('change status', function(data){
      //console.log(socket.user);
      Models.User.findById(data._id, function(err,user){
        if(err){
          console.log(err);
        }
        if(user != null){
          user.status = data.status
          user.save(function(err){
            if(err){
              console.log(err);
            }

            team = updateUserInTeam(team,user);
            socket.emit('status changed', user);
            //console.log(team);
            io.emit('refreshTeam', team);
          })
        }
      })
  });

  socket.on('delete user', function(data){
    Models.User.findOne({'username' : data.username}).remove(function(err){
      if(err){
        console.log(err);
      }
      removeUserFromTeam(team,username);
      io.emit('refreshTeam',team);
    })
  })

  socket.on('logout', function(data){
    Models.User.findById( data._id, function(err,user){
      if(err){
        console.log(err);
      }
      if(user != null){
        user.connected = false;
        user.save(function(err){
          if(err){
            console.log(err);
          }
          team = updateUserInTeam(team, user);
          io.emit('refreshTeam',team);
          socket.emit('logout done');
        })
      }
    })

  })


});

function removeUserFromTeam(team,username){
  var index = arrayUsernameIndexOf(team, username);
  team.splice(index,1);
  return team;
}

function updateUserInTeam(team,user){
  var index = arrayUsernameIndexOf(team,user.username);
  team[index] = user;
  console.log(team);
  return team;
}

function arrayUsernameIndexOf(array,usernameToFind){
  for(var i = 0, len = array.length; i < len; i++) {
    //console.log(myArray[i]);
      //console.log(array[i]);
      if (array[i].username === usernameToFind) return i;
  }
  return -1;
}
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
    	//console.log(myArray[i]);
    	  //console.log(myArray[i]);
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}
