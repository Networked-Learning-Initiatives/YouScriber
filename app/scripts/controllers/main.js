'use strict';

String.prototype.toHHMMSS = function () {
  var sec_num = parseInt(this, 10); // don't forget the second param
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  var time    = hours+':'+minutes+':'+seconds;
  return time;
}

angular.module('youScriberApp').controller('MainCtrl', function ($scope, $window, $firebase, $routeParams) {
  $scope.awesomeThings = [
    'HTML5 Boilerplate',
    'AngularJS',
    'Karma'
  ];
  
  $scope.videoId = 'oHg5SJYRHA0';//'jofNR_WkoCE';
  
  if ($routeParams.hasOwnProperty('videoId')) {
    $scope.videoId = $routeParams.videoId;
  }

  var videosRef = new Firebase("https://amber-fire-1732.firebaseio.com/videos");
  $scope.videos = $firebase(videosRef);

  $scope.comments = {};
  
  $scope.videos.$on("loaded", function(value) {
    $scope.comments = value[$scope.videoId];
  });

  $scope.$watch('videos', function(newValue, oldValue){
    if (newValue[$scope.videoId] && newValue[$scope.videoId].hasOwnProperty('comments')) {
      $scope.comments = newValue[$scope.videoId].comments;
    }
  }, true);

  $scope.playerId = Math.floor(Math.random()*10000000);
  $scope.newComment = '';
  $scope.player = false;



  $window.onYouTubePlayerReady = function (id) {
    $scope.player = document.getElementById('ytPlayer-'+$scope.playerId);
    $scope.player.playVideo();
  };

  $scope.post = function() {
    var timecode = $scope.player.getCurrentTime().toString().replace(/\./g,'-');

    var theNewComment = {
      time: $scope.player.getCurrentTime(),
      comment: $scope.newComment
    };

    if (!$scope.videos.hasOwnProperty($scope.videoId)) {
      var tmp = {};
      tmp[$scope.videoId] = {comments:[theNewComment]};
      $scope.videos.$update(tmp);
    } else if ($scope.videos[$scope.videoId].hasOwnProperty('comments')) {
      $scope.videos[$scope.videoId].comments.push(theNewComment);
      $scope.videos.$save($scope.videoId);
    } else {
      $scope.videos[$scope.videoId].comments = [theNewComment];
      $scope.videos.$save($scope.videoId);
    }

    $scope.newComment = '';
    $scope.player.playVideo();
  };

  $scope.typing = function() {
    $scope.player.pauseVideo();
  }; 

  $scope.seekTo = function(t) {
    $scope.player.seekTo(t, true);
  };

}).filter('timefilter', function() {
  return function(input) {
    if (Array.isArray(input)) {
      input.sort(function (a, b) { return a.time-b.time; });
    }
    return input;
  };
}).filter('secondsfilter', function() {
  return function(input) {
    if (input) {
      input = input.toString();
      return input.toHHMMSS();
    }
    return input;
  };
});
