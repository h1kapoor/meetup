// Initialize Firebase
var config = {
  apiKey: "your firebase api key here",
  authDomain: "meetup-b5115.firebaseapp.com",
  databaseURL: "https://meetup-b5115.firebaseio.com",
  storageBucket: "meetup-b5115.appspot.com",
  messagingSenderId: "114721961332"
};
firebase.initializeApp(config);

var database = firebase.database();

function user1Submit(){
  var userId = $("#name").val();
  var startLocation = $("#org-input").val();
  var location = $("#pac-input").val();
  // var time = calculateTime(startLocation, location);
  var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&' + encodeURI('origins=' + startLocation + '&destinations=' + location) + '&key= google api key here';

  $.get(url, function(data, status) {
    var time = data.rows[0].elements[0].duration.value / 60;

    firebase.database().ref('users/' + userId).set({
      "time" : time,
      "match" : "null",
      "location" : location
    });

    $("#main").fadeOut();
    $("#waiting").fadeIn(4000);

    firebase.database().ref('users/' + userId).on('value', function(snapshot) {
      var friendId = '';

      if (snapshot.val().match !== "null") {
        friendId = snapshot.val().match;
        $("#waiting").fadeOut();

        // get your friend's ETA
        firebase.database().ref('users/' + friendId + '/time').once('value', function(timeSnapshot) {
          var friendETA = timeSnapshot.val();

          if (time > friendETA){
            $('#leave').fadeIn(1000);
          }
          else{
            var diff = friendETA - time;
            $('#wait').fadeIn(1000);
            $("#countdown").text(Math.round(diff));
            setInterval(function(){
              var countdownTimer = $("#countdown").text();
              if (countdownTimer - 1 !== 0)
                $("#countdown").text(countdownTimer - 1);
              else {
                // notification and change text to YOU SHOULD LEAVE NOW
                $("#timeToLeave").text("It's time to leave!")

                Notification.requestPermission(function (permission) {
                      // If the user accepts, let's create a notification
                      if (permission === "granted") {
                        var notification = new Notification("It's time to leave!");
                      }
                    });
              }
            }, 3000)
          }

        })

      }
    });
  })
}

function user2Submit(){
  $("#join-main").fadeOut();
  var userId = $("#joinuserId").val();
  var friendId = $("#frienduserId").val();

  var update = {};
  update['/match'] = userId;

  firebase.database().ref('users/' + friendId + '/location').once('value', function(location) {
    var loc = location.val();
    var origin = $("#org-input").val();
    var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&' + encodeURI('origins=' + origin + '&destinations=' + loc) + '&key= google api key here';

    $.get(url, function(data, status) {
      var time = data.rows[0].elements[0].duration.value / 60;

      firebase.database().ref('users/' + userId).set({
        "time" : time,
        "match" : friendId,
        "location" : loc
      });

      firebase.database().ref('users/' + friendId).update(update)

      firebase.database().ref('users/' + friendId + '/time').once('value', function(timeSnapshot) {
        var friendETA = timeSnapshot.val();

        if (time > friendETA){
          $('#leave').fadeIn(1000);
        }
        else{
          $('#wait').fadeIn(1000);
          var diff = friendETA - time;
          $("#countdown").text(Math.round(diff));
          setInterval(function(){
            var countdownTimer = $("#countdown").text();
            if (countdownTimer - 1 !== 0)
              $("#countdown").text(countdownTimer - 1);
            else {
              // notification and change text to YOU SHOULD LEAVE NOW
              $("#timeToLeave").text("It's time to leave!")

              Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                  var notification = new Notification("It's time to leave!");
                }
              });

            }
          }, 3000)
        }

      })
    })


  })
}
