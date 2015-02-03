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

angular.module('youScriberApp').controller('VideoCtrl', function ($scope, $window, $routeParams, $location, $rootScope, Videos, User) {
  $scope.videoId = $routeParams.videoId; //this is the video's id in OUR database
  // $scope.videoYTId;
  $scope.videoIdInProgress = $scope.videoId;
  // $scope.videoMetadata = {};
  var videoScope = $scope;

  $scope.userService = User;

  $scope.Math = window.Math;

  $scope.isCurrentComment = function(comment){
    var delta = $scope.videoTime - comment.time;
    return 0<=delta && delta < 1.3;
  };
  
  if ($routeParams.hasOwnProperty('videoId')) {
    console.log('found video id:', $routeParams.videoId);
    $scope.videoId = $routeParams.videoId;
    Videos.getVideo($scope.videoId);
  }

  $scope.videosService = Videos;
  $scope.videoYTId = Videos.currentVideo.ytid;

  // var videosRef = new Firebase("https://amber-fire-1732.firebaseio.com/videos");
  // $scope.videos = $firebase(videosRef);

  $scope.comments = {};
  
  // $scope.videos.$on("loaded", function(value) {
  //   if (value &&value.hasOwnProperty($scope.videoId)) {
  //     $scope.comments = value[$scope.videoId];
  //   }
  // });

  // $scope.$watch('videos', function(newValue, oldValue){
  //   if (newValue[$scope.videoId] && newValue[$scope.videoId].hasOwnProperty('comments')) {
  //     $scope.comments = newValue[$scope.videoId].comments;
  //   }
  // }, true);

  $scope.playerId = Math.floor(Math.random()*10000000);
  $scope.newComment = '';
  $scope.player = false;



  $window.onYouTubePlayerReady = function (id) {
    $scope.player = document.getElementById('ytPlayer-'+$scope.playerId);
    $scope.player.playVideo();
  };

  $scope.thumbnails = function() {
    var thumbs = [];
    for (var i=0; i<$scope.videoMetadata.entry.media$group.media$thumbnail.length; i++) {
      thumbs.push($scope.videoMetadata.entry.media$group.media$thumbnail[i].url);
    }
    return thumbs;
  }

  $scope.post = function() {
    // var timecode = $scope.player.getCurrentTime().toString().replace(/\./g,'-');

    var theNewComment = {
      time: $scope.player.getCurrentTime(),
      comment: $scope.newComment
    };

    // if (!$scope.videos.hasOwnProperty($scope.videoId)) {
    //   var tmp = {};
    //   tmp[$scope.videoId] = {
    //     comments:[theNewComment],
    //     title: $scope.videoMetadata.entry.title.$t,
    //     thumbnails: $scope.thumbnails()
    //   };
    //   $scope.videos.$update(tmp);
    // } else {
    //   if (!$scope.videos[$scope.videoId].hasOwnProperty('title')) {
    //     $scope.videos[$scope.videoId].title = $scope.videoMetadata.entry.title.$t;
    //     $scope.videos[$scope.videoId].thumbnails = $scope.thumbnails();
    //   }

    //   if ($scope.videos[$scope.videoId].hasOwnProperty('comments')) {
    //       $scope.videos[$scope.videoId].comments.push(theNewComment);
    //       $scope.videos.$save($scope.videoId);
    //   } else {
    //     $scope.videos[$scope.videoId].comments = [theNewComment];
    //     $scope.videos.$save($scope.videoId);
    //   }
    // }

    Videos.addComment(theNewComment);

    $scope.newComment = '';
    $scope.player.playVideo();
  };

  $scope.typing = function() {
    $scope.player.pauseVideo();
  }; 

  $scope.seekTo = function(t) {
    $scope.player.seekTo(t, true);
    $('textarea#comment').focus();
  };

  $rootScope.$on('seek-to', function(evt, t){
    videoScope.seekTo(t);
  });

  $scope.changeVideo = function() {
    // $scope.videoId = $scope.videoIdInProgress;
    $location.path('/video/'+$scope.videoIdInProgress);
  };

  $scope.videoTime = 0;

  $scope.$on("$destroy", function() {
    //TODO: cancel timer(s) created by yt directive!
    Videos.currentVideo = {};
  });

  $scope.updateTime = function(comment) {
    console.log('\n\n\ncomment time updated\n\n\n');
    console.log(comment);

    // actually update the server with the new time: comment.time
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
