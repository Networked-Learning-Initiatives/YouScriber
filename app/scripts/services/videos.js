'use strict';
angular.module('youScriberApp').service('Videos', function ($rootScope, $http, $q, User, $location, $state) {

  var videosService = this;

  this.videos = [];
  this.filter = "";
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

  this.getPublicVideos = function (user) {
    // console.log('in getPublicVideos');

    var queryParams = {};
    if (user) {
      queryParams.user = user;
    }

    $http({method: 'GET', url: '/api/videos', params: queryParams}).success(function (results) {
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
        // consider adding this info instead to the videoService.videos
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
          videosService.currentVideo = results.video;
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

  function findCommentByTimeAndContent(time, content) {
    videosService.currentVideo.comments.forEach(function (comment, i) {
      if (comment.time == time && comment.content == content) {
        return i;
      }
    });
    return -1;
  }

  this.addComment = function (timeAndComment) {
    console.log('videoservice addComment');
    console.log(timeAndComment);
    var videoForComment = videosService.currentVideo;
    if (videosService.currentVideo.hasOwnProperty('comments')) {
      var newComment = {comment: {time: timeAndComment.time, content: timeAndComment.comment, user: User.user.id, name: User.user.name,  video: videosService.currentVideo.id}};
      $http({method: 'GET', url: '/api/comment/new', params: newComment})
        .success(function (results) {
          if (videosService.currentVideo.ytid == videoForComment.ytid) { //try to make sure they didn't change videos since they posted the comment?
            var commentIdx = findCommentByTimeAndContent(timeAndComment.time, timeAndComment.comment);
            if (commentIdx >= 0) {
              videosService.currentVideo.comments[commentIdx].id = results.id;  // TODO:maybe also change some css here 
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

  this.removeEntitiesPermissionsFromVideo = function (vid, entities, permGroup) {
    console.log('removeEntitiesPermissionsFromVideo::vid, entities, permGroup', vid, entities, permGroup);
    return $q(function (resolve, reject) {
      $http.post('/api/video/' + vid + '/entity-drop', {entities: entities, user: User.user.id, permGroup: permGroup})
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

  this.canAdmin = function () {
    //is the current user in the user permissions (with admin?)

    if (!videosService.currentVideo) {
      return false;
    }

    if (videosService.currentVideo && videosService.currentVideo.permissions && videosService.currentVideo.permissions.users) {
      var userCanAdmin = Object.keys(videosService.currentVideo.permissions.users).some(function (permKey) {
        var perm = videosService.currentVideo.permissions.users[permKey];
        return perm.id === User.user.id && perm.hasOwnProperty('admin') && perm.admin;
      });
      if (userCanAdmin) {
        return true;
      }
    }

    if (videosService.currentVideo && videosService.currentVideo.permissions && videosService.currentVideo.permissions.groups) {
      var groupCanAdmin = Object.keys(videosService.currentVideo.permissions.groups).some(function (permKey) {
        var perm = videosService.currentVideo.permissions.groups[permKey];
        return User.user.groups.some(function (group) {
          // if (perm.id === group.id && perm.hasOwnProperty('admin') && perm.admin) {
          //   return true;
          // }
          return perm.id === group.id && perm.hasOwnProperty('admin') && perm.admin;
        });
      });
      if (groupCanAdmin) {
        return true;
      }
    }

    if (videosService.currentVideo && videosService.currentVideo.permissions && videosService.currentVideo.permissions.organizations) {
      var orgCanAdmin = Object.keys(videosService.currentVideo.permissions.organizations).some(function (permKey) {
        var perm = videosService.currentVideo.permissions.organizations[permKey];
        return User.user.orgs.some(function (org) {
          // if (perm.id === org.id && perm.hasOwnProperty('admin') && perm.admin) {
          //   return true;
          // }
          return perm.id === org.id && perm.hasOwnProperty('admin') && perm.admin;
        });
      });
      if (orgCanAdmin) {
        return true;
      }
    }


    return false;
  };

  this.userCan = function (permType) {
    // console.log('can:', permType);
    // console.log(videosService.currentVideo.permissions.users.tgm);
    if (videosService.currentVideo && videosService.currentVideo.permissions && videosService.currentVideo.permissions.users) {
      var entityCanPerm = Object.keys(videosService.currentVideo.permissions.users).some(function (permKey) {
        var perm = videosService.currentVideo.permissions.users[permKey];
        // console.log(perm);
        // console.log(User.user);
        return perm.id === User.user.id && perm.hasOwnProperty(permType) && perm[permType];
        
      });
      if (entityCanPerm) {
        return true;
      }
    }

    if (videosService.currentVideo && videosService.currentVideo.permissions && videosService.currentVideo.permissions.groups) {
      var entityCanPerm = Object.keys(videosService.currentVideo.permissions.groups).some(function (permKey) {
        var perm = videosService.currentVideo.permissions.groups[permKey];
        return User.user.groups.some(function (group) {
          return perm.id === group.id && perm.hasOwnProperty(permType) && perm[permType];
        });
      });
      if (entityCanPerm) {
        return true;
      }
    }

    if (videosService.currentVideo && videosService.currentVideo.permissions && videosService.currentVideo.permissions.organizations) {
      var entityCanPerm = Object.keys(videosService.currentVideo.permissions.organizations).some(function (permKey) {
        var perm = videosService.currentVideo.permissions.organizations[permKey];
        return User.user.orgs.some(function (org) {
          return perm.id === org.id && perm.hasOwnProperty(permType) && perm[permType];
        });
      });
      if (entityCanPerm) {
        return true;
      }
    }
    return false;
  };

});