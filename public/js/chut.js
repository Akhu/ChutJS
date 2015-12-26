// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

function notifyMe(notificationText,notificationTitle) {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification(notificationTitle, {
      icon: '/images/chut-logo.png',
      body: notificationText,
    });

    notification.onclick = function () {
      window.open('http://localhost:3000/');
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
  $("#chut-all").click(function(e){
    e.preventDefault();
    if(currentUser.chutCount <= 0){
      return false;
    }else{
      socket.emit('chut',{to:'all', me:currentUser});
    }

  })

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
        saveCurrentUserToLocal(currentUser);
        refreshMe(currentUser);
     })
  })

  $("#logout").click(function(e){
    e.preventDefault();
    socket.emit('logout', currentUser);
  });

  socket.on('chut', function(data){
      notifyMe('Faites moins de bruit, cela déconcentre vos collègues :x','Chut !');
  });

  socket.on('chut done', function(data){

  })

  socket.on('logout done', function(){
    localStorage.clear();
    $('#profil-infos').fadeOut();
    $('#team').fadeOut();
    $('#login').fadeIn('fast');
  })

  socket.on('me updated', function(data){
    currentUser = data;
    saveCurrentUserToLocal(currentUser);
    refreshMe(currentUser);
  })

  socket.on('login done',function(data){
    saveCurrentUserToLocal(data);
    currentUser = JSON.parse(localStorage.user);
    $("#login").hide('fast');
    $('#profil-infos').fadeIn('fast');
    $('#me').text('Salut '+currentUser.username);
    //console.log(data);
    refreshMe(currentUser);
    connected = true;
  });

  socket.on('refreshTeam', function(data){
    console.log(data);
    refreshTeam(data);
  })

  function saveCurrentUserToLocal(user){
     localStorage.setItem('user', JSON.stringify(user));
  }

  function refreshMe(user){
    if(user.chutCount <= 0){
      $('#remaining-chut').attr('disabled','disabled');
    }else{
      $('#remaining-chut').removeAttr('disabled');
    }
    $('#remaining-chut').text(user.chutCount);
    $('#my-status').text(statusToText(user.status));
    $('#my-status').removeClass('free').removeClass('nope').removeClass('soon');
    $('#my-status').addClass(user.status);
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
        $('#team ul').append('<li class="teammate"><span class="status-box '+user.status+'">'+statusText+'</span> <b>'+user.username+'</b>  </li>');
      }

    });
  }
})
