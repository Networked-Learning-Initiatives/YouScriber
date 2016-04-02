'use strict';
angular.module('youScriberApp').service('Videos', function ($rootScope, $http, $q, User, $location, $state) {

  var videosService = this;

  this.videos = [];
  this.filter = '';
  this.videoFiltered = function () {
    if (videosService.filter.length > 0) {
      var results = videosService.videos.filter(function (element) {
        return element.title.toLowerCase().indexOf(videosService.filter.toLowerCase()) >= 0;
      });
      console.log(results);
      return results;
    }
    return videosService.videos;
  };
  this.currentVideo = {};
  this.currentVideoPerms = {};

  this.getCurrentVideo = function () {
    return this.currentVideo;
  };

  this.getPublicVideos = function (user) {
    // console.log('in getPublicVideos');

    var queryParams = {};
    if (user) {
      queryParams.user = user;
    }

    $http({method: 'GET', url: '/api/videos', params: queryParams}).success(function (results) {
      console.log('setting videos locally in video service to', results);
      videosService.videos = results;
    });
  };

  // console.log('getPublicVideos from service body');
  if (User.user) {
    this.getPublicVideos(User.user);
  } else {
    this.getPublicVideos();
  }

  $rootScope.$on('user-logged-in', function () {
    console.log('user-logged-in');
    videosService.getPublicVideos(User.user);
  });

  this.newVideo = function (ytid) {
    var params = {};
    if (User.loggedIn()) {
      params.user = User.user;
    } else {
      console.log('got logged out!');
    }
    params.ytid = ytid;
    $http({method: 'GET', url: '/api/video/new', params: params})
      .success(function (results) {
        // consider adding this info instead to the videosService.videos
        console.log(results);
        videosService.currentVideo = results;
        // $rootScope.$apply(function(){
          // $location.path('/video/'+videosService.currentVideo.id);
        $state.go('video.comments', {videoId: videosService.currentVideo.id});
        // });
      })
      .error(function (error) {
        console.log('error creating new video', error);
      });
  };

  this.getVideo = function (id) {
    this.currentVideo = $q(function (resolve, reject) {
      var params = {};
      if (User.loggedIn()) {
        params.user = User.user;
      }
      $http({method: 'GET', url: '/api/videos/' + id, params: params})
        .success(function (results) {
          // console.log('results');
          // console.log(results);
          videosService.currentVideo = results.video;
          videosService.currentVideoPerms = results.can;

          // console.log('resolving', videosService.currentVideo);
          resolve(videosService.currentVideo);
        })
        .error(function (error) {
          console.error('error getting video by id', id, error);
          reject(error);
        });
    });
    return this.currentVideo;
  };

  this.getPermissions = function (videoId) {
    var promise = $q(function (resolve, reject) {
      var params = {};
      if (User.loggedIn()) {
        params.user = User.user;
      }
      $http({method: 'GET', url: '/api/videos/' + videoId +'/permissions', params: params})
        .success(function (results) {
          resolve(results);
        })
        .error(function (error) {
          console.error('error getting video permissions by videoId', videoId, error);
          reject(error);
        });
      });
    return promise;
  };

  function findCommentByTimeAndContent(time, content) {
    // console.log(time, content, videosService.currentVideo.comments);
    var idx = -1;
    videosService.currentVideo.comments.some(function (comment, i) {
      // console.log('comment.time == time && comment.content == content');
      // console.log(comment.time, comment.content);
      // console.log(comment.time == time, comment.content == content);
      if (comment.time == time && comment.content == content) {
        idx = i;
        return true;
      }
    });
    return idx;
    // return -1;
  }

  this.addComment = function (timeAndComment) {
    // console.log('videosService addComment');
    // console.log(timeAndComment);
    var videoForComment = videosService.currentVideo;
    if (videosService.currentVideo.hasOwnProperty('comments')) {
      var newComment = {comment: {time: timeAndComment.time, content: timeAndComment.comment, author: User.user,  video: videosService.currentVideo.id}};
      $http({method: 'GET', url: '/api/comment/new', params: newComment})
        .success(function (results) {
          if (videosService.currentVideo.ytid == videoForComment.ytid) { //try to make sure they didn't change videos since they posted the comment?
            var commentToUpdate = findCommentByTimeAndContent(timeAndComment.time, timeAndComment.comment);
          // console.log('commentIdx', commentIdx);
            if (commentToUpdate > 0) {
              console.log('update it then', commentToUpdate);
              console.log(videosService.currentVideo.comments[commentToUpdate]);
              videosService.currentVideo.comments[commentToUpdate].id = results.id;  // TODO:maybe also change some css here 
                                                                                // so that they know the comment was saved 
                                                                                // successfully, or to make it possible to edit comment
            }
          }
        })
        .error(function (error) {
          console.error('error adding comment', error);
        });
      videosService.currentVideo.comments.push(newComment.comment);

      videosService.videos.forEach(function (video) {
        if (videosService.currentVideo.id == video.id) {
          video.comments++;
        }
      });
    }
  };

  this.removeEntitiesPermissionsFromVideo = function (vid, entities) {
    console.log('removeEntitiesPermissionsFromVideo::vid, entities', vid, entities);
    return $q(function (resolve, reject) {
      $http.post('/api/video/' + vid + '/entity-drop', {entities: entities, user: User.user.id})
      .success(function () {
        resolve(true);
      })
      .error(function (error) {
        reject(error);
      });
    });
  };

  this.updateEntityPermissionsToVideo = function (videoId, entityPerm) {
    console.log('updateEntityPermissionsToVideo::videoId, entityPerm:', videoId, entityPerm);
    return $q(function (resolve, reject) {
      $http.post('/api/video/'+videoId+'/entity-mod', {entityPerm:entityPerm, user:User.user.id})
        .success(function () {
          resolve(true);
        })
        .error(function (error) {
          reject(error);
        });
    });
  };

  this.addEntityPermissionsToVideo = function (videoId, entityPerm) {
    console.log('addEntityPermissionsToVideo::videoId, entityPerm:', videoId, entityPerm);
    return $q(function (resolve, reject) {
      $http.post('/api/video/'+videoId+'/entity-add', {entityPerm:entityPerm, user:User.user.id})
        .success(function () {
          resolve(true);
        })
        .error(function (error) {
          reject(error);
        });
    });
  };

  this.canAdmin = function () {
    //is the current user in the user permissions (with admin?)

    if (!videosService.currentVideo) {
      return false;
    }

    if (videosService.currentVideoPerms.hasOwnProperty('canAdmin') && videosService.currentVideoPerms.canAdmin === true) {
      return true;
    }


    return false;
  };

  this.userCan = function (permType) {
    // console.log('usercan', permType);
    // console.log(videosService.currentVideoPerms);
    // console.log(videosService.currentVideoPerms.hasOwnProperty('can'+permType) && videosService.currentVideoPerms['can'+permType] === true);
    return (videosService.currentVideoPerms.hasOwnProperty('canAdmin') 
      && videosService.currentVideoPerms.canAdmin === true) || // if user can admin, they can do anything
      videosService.currentVideoPerms.hasOwnProperty('can'+permType) && // otherwise they should have the correct perm
      videosService.currentVideoPerms['can'+permType] === true;
  };
});