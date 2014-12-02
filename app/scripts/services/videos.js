'use strict';
angular.module('youScriberApp').service('Videos', function ($rootScope, $http, $q, User, $location) {

  var videosService = this;

  this.videos = [];
  this.currentVideo = {};

  this.getPublicVideos = function (user) {
    console.log(user);

    var queryParams = {}
    if (user) {
      queryParams.user = user;
    }

    $http({method: 'GET', url: '/api/videos', params:queryParams}).success(function(results){
      videosService.videos = results;
    });
  };

  this.getPublicVideos();

  $rootScope.$on('user-logged-in', function() {
    console.log('user-logged-in');
    videosService.getPublicVideos(User.user);
  });

  this.newVideo = function(ytid) {
    var params = {};
    if (User.loggedIn()) {
      params.user = User.user;
    } else {
      console.log('got logged out!');
    }
    params.ytid = ytid;
    $http({method: 'GET', url: '/api/video/new', params:params}).success(function(results) {
      // consider adding this info instead to the videoService.videos
      console.log(results);
      videosService.currentVideo = results;
      // $rootScope.$apply(function(){
        $location.path('/video/'+videosService.currentVideo.id);
      // });
    });
  };

  this.getVideo = function(id) {
    var params = {};
    if (User.loggedIn()) {
      params.user = User.user;
    } else {
      console.log('got logged out!');
    }
    console.log(params);
    $http({method: 'GET', url: '/api/videos/'+id, params:params}).success(function(results) {
      // consider adding this info instead to the videoService.videos
      // console.log(results.video[0]);
      videosService.currentVideo = results.video;
      // console.log(videosService.currentVideo.ytid);
      console.log(videosService.currentVideo);
    });
  };

  function findCommentByTimeAndContent (time, content) {
    for (var i=0; i<videosService.currentVideo.comments.length; i++) {
      if (videosService.currentVideo.comments[i].time == time && videosService.currentVideo.comments[i].content == content) {
        return i;
      }
    }
    return -1;
  }

  this.addComment = function(timeAndComment) {
    console.log('Videos::addComment:', timeAndComment);
    console.log(this.currentVideo);
    var videoForComment = this.currentVideo;
    if (this.currentVideo.hasOwnProperty('comments')) {
      var newComment = {comment:{time:timeAndComment.time, content:timeAndComment.comment, user:User.user.id, video:this.currentVideo.id}};
      $http({method: 'GET', url: '/api/comment/new', params:newComment}).success(function(results) {
        console.log(results);
        if (videosService.currentVideo.ytid == videoForComment.ytid) { //try to make sure they didn't change videos since they posted the comment?
          var commentIdx = findCommentByTimeAndContent(timeAndComment.time, timeAndComment.comment);
          if (commentIdx >= 0) {
            videosService.currentVideo.comments[commentIdx].id = results.id;  // TODO:maybe also change some css here 
                                                                              // so that they know the comment was saved 
                                                                              // successfully, or to make it possible to edit comment
          }
        }
      });
      this.currentVideo.comments.push(newComment.comment);
      console.log(this.currentVideo.comments);
    }
  };

});