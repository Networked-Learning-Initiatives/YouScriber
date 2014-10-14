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

});