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

angular.module('youScriberApp').controller('VideoCtrl', function ($scope, $window, $stateParams, $location, $rootScope, Videos, User, Player, $state) {
  $scope.videoId = $stateParams.videoId; //this is the video's id in OUR database
  // $scope.videoYTId;
  $scope.videoIdInProgress = $scope.videoId;
  // $scope.videoMetadata = {};
  var videoScope = $scope;

  $scope.userService = User;

  $scope.Math = window.Math;
  
  if ($stateParams.hasOwnProperty('videoId')) {
    // console.log('found video id:', $stateParams.videoId);
    $scope.videoId = $stateParams.videoId;
    Videos.getVideo($scope.videoId);
  }

  $scope.videosService = Videos;
  $scope.videoYTId = Videos.currentVideo.ytid;

  $scope.comments = {};

  $scope.playerId = Player.playerId;
  $scope.newComment = '';
  // $scope.player = false;
  $scope.playerService = Player;

  $scope.thumbnails = function() {
    var thumbs = [];
    for (var i=0; i<$scope.videoMetadata.entry.media$group.media$thumbnail.length; i++) {
      thumbs.push($scope.videoMetadata.entry.media$group.media$thumbnail[i].url);
    }
    return thumbs;
  }

  $scope.post = function() {
    console.log("posting");
    var theNewComment = {
      time: $scope.playerService.getCurrentTime(),
      comment: $scope.newComment
    };

    Videos.addComment(theNewComment);

    $scope.newComment = '';
    $scope.playerService.playVideo();
  };

  $scope.typing = function() {
    $scope.playerService.pauseVideo();
  }; 

  $scope.videoTime = 0;

  $scope.$on("$destroy", function() {
    //TODO: cancel timer(s) created by yt directive!
    Videos.currentVideo = {};
  });

  $scope.updateTime = function(comment) {
    // console.log('\n\n\ncomment time updated\n\n\n');
    // console.log(comment);

    // actually update the server with the new time: comment.time
  };

  $scope.settings = function() {
    $state.go('video.comments.settings');
  };

  $scope.$watch('newComment', function () {
    console.log($scope.newComment);
  });

  $scope.textAreaSetup = function($element) {
    $element.attr('ng-change', 'typing()');
    $element.attr('autofocus', '');
    $element.attr('enter-submit', 'post()');
    // id="comment" class="form-control input-lg"
    $element.attr('id', 'comment');
    $element.attr('class', 'form-control input-lg new-comment-box');
  }
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
