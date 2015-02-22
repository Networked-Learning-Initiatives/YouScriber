'use strict';
angular.module('youScriberApp').service('Videos', function ($rootScope, $http, $q, User, $location, $state) {

  var videosService = this;

  this.videos = [];
  this.currentVideo = {};

  this.getPublicVideos = function (user) {
    // console.log(user);

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
        // $location.path('/video/'+videosService.currentVideo.id);
        $state.go('video.comments', {videoId: videosService.currentVideo.id});
      // });
    });
  };

  this.getVideo = function(id) {
    this.currentVideo = $q(function (resolve, reject) {
      var params = {};
      if (User.loggedIn()) {
        params.user = User.user;
      } 
      $http({method: 'GET', url: '/api/videos/'+id, params:params})
        .success(function (results) {
          videosService.currentVideo = results.video;
          console.log('resolving', videosService.currentVideo);
          resolve(videosService.currentVideo);
        })
        .catch(function (error) {
          console.error('error getting video by id', id, error);
          reject(error);
        });
    });
    return this.currentVideo;
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
    console.log('videoservice addComment');
    console.log(timeAndComment);
    var videoForComment = this.currentVideo;
    if (this.currentVideo.hasOwnProperty('comments')) {
      var newComment = {comment:{time:timeAndComment.time, content:timeAndComment.comment, user:User.user.id, name:User.user.name,  video:this.currentVideo.id}};
      $http({method: 'GET', url: '/api/comment/new', params:newComment}).success(function(results) {
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
      for (var i=0; i<this.videos.length; i++) {
        if (this.currentVideo.id == this.videos[i].id) {
          this.videos[i].comments++;
        }
      }
    }
  };

  this.removeEntitiesPermissionsFromVideo = function (vid, entities, permGroup) {
    console.log('removeEntitiesPermissionsFromVideo::vid, entities, permGroup', vid, entities, permGroup);
    return $q(function (resolve, reject) {
      $http.post('/api/video/'+vid+'/entity-drop', {entities:entities, user:User.user.id, permGroup:permGroup})
      .success(function () {
        resolve(true);
      })
      .error(function (error) {
        reject(error);
      });
    });
  };

  this.updateEntityPermissionsToVideo = function (entity, permGroup, video, permissions) {
    console.log('updateEntityPermissionsToVideo::entity, permGroup, video, permissions:', entity, permGroup, video, permissions);
    return $q(function (resolve, reject) {
      $http.post('/api/video/'+video+'/entity-mod', {entity:entity, user:User.user.id, permissions:permissions, permGroup:permGroup})
      .success(function () {
        resolve(true);
      })
      .error(function (error) {
        reject(error);
      });
    });
  };

  this.addEntityPermissionsToVideo = function (entity, permGroup, video, permissions) {
    console.log('addEntityPermissionsToVideo::entity, permGroup, video, permissions:', entity, permGroup, video, permissions);
    return $q(function (resolve, reject) {
      $http.post('/api/video/'+video+'/entity-add', {entity:entity, user:User.user.id, permissions:permissions, permGroup:permGroup})
      .success(function () {
        resolve(true);
      })
      .error(function (error) {
        reject(error);
      });
    });
  };

});