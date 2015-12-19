// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

function notifyMe() {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Notification title', {
      icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      body: "Hey there! You've been notified!",
    });

    notification.onclick = function () {
      window.open("http://stackoverflow.com/a/13328397/1269037");
    };

  }

}

$(document).ready(function(){

  var socket = io.connect('http://localhost:3000');
  var currentUser;
  var connected = false;
  if(typeof(Storage) !== "undefined") {
    console.log('Local Storage : ok');
    //Check if a user exists :
    if(typeof localStorage.user !== 'undefined' ){
      currentUser = JSON.parse(localStorage.user);
      //console.log(currentUser);
      socket.emit('login', currentUser);
    }else{
      $('#login').show('fast');
    }
  } else {
    alert('Navigateur non pris en charge, rien ne sera sauvegardé :(');
  }

  $("#sendUsername").click(function(e){
    e.preventDefault();
    var data = getFormData();
    socket.emit('login', data);
  })

  $("#change-status").change(function(){
     var value;
     $("#change-status option:selected").each(function(){
        value = $(this).val();
        currentUser.status = value;
        socket.emit('change status', currentUser);
     })
  })

  $("#logout").click(function(e){
    e.preventDefault();
    socket.emit('logout', currentUser);
  });

  socket.on('logout done', function(){
    localStorage.clear();
    $('#profil-infos').fadeOut();
    $('#team').fadeOut();
    $('#login').fadeIn('fast');
  })

  socket.on('me updated', function(data){
    currentUser = data;
    saveCurrentUserToLocal(currentUser);
  })

  socket.on('login done',function(data){
    saveCurrentUserToLocal(data);
    currentUser = JSON.parse(localStorage.user);
    $("#login").hide('fast');
    $('#profil-infos').fadeIn('fast');
    $('#me').text('Salut '+currentUser.username);
    //console.log(data);
    connected = true;
  });

  socket.on('refreshTeam', function(data){
    console.log(data);
    refreshTeam(data);
  })

  function saveCurrentUserToLocal(user){
     localStorage.setItem('user', JSON.stringify(user));
  }

  function getFormData(){

    var username = $("#username").val();
    var status = $("input:radio[name ='status']:checked").val();
    var data = {'username' : username, 'status' : status};
    return data;
  }

  function statusToText(status){
    switch (status){
      case 'free' :
      return 'Disponible';
      break;
      case 'soon' :
      return 'Bientôt disponible';
      break;
      case 'nope' :
      return 'Occupé!';
      break;
      case 'away' :
      return 'Absent';
      break;
      default:
      return 'Statut inconnu';
      break
    }
  }



  function refreshTeam(teamArray){
    $('#team ul').text('');
    teamArray.forEach(function(user,index){
      var statusText = statusToText(user.status);
      if(!user.connected){
        $('#team ul').append('<li class="teammate disconnected"><b>'+user.username+'</b> Disconnected </li>');
      }else{
        $('#team ul').append('<li class="teammate"><b>'+user.username+'</b> '+statusText+'</li>');
      }

    });
  }
})
