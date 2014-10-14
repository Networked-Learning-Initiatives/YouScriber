'use strict';
angular.module('youScriberApp').service('Videos', function ($rootScope, $http, $q, User) {

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

  this.getVideo = function(id) {
    var params = {};
    if (User.loggedIn()) {
      params.user = User.user;
    }
    console.log(params);
    $http({method: 'GET', url: '/api/videos/'+id, params:params}).success(function(results) {
      // consider adding this info instead to the videoService.videos
      console.log(results);
      videosService.currentVideo = results;
    });
  };

});