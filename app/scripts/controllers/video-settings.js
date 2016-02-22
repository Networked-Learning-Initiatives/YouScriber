'use strict';

angular.module('youScriberApp').controller('VideoSettings', function ($scope, $http, User, video, Videos, $state, $modalInstance, permissions, $stateParams) {
  $scope.usernameSelected = '';

  $scope.tabs = {
    user: true,
    group: false,
    organization: false,
  };

  $(document).on('keyup', function(e) {
    console.log('esc!');
    if(e.keyCode == 27) {
      $(document).off('keyup');
      $scope.dismiss();
    }
  });

  if ($stateParams.hasOwnProperty('tab') && $stateParams.tab in $scope.tabs) {
    $scope.tabs.user = false;
    $scope.tabs[$stateParams.tab] = true;
  }

  $scope.userId = User.user.id;

  $scope.video = video;
  console.log(permissions);
  $scope.permissions = permissions;

  // remember the initial permissions so we can diff when they save
  $scope.initialPermissions = $scope.permissions;

  function didPermsChanged (initial, final) {
    return initial.permission.view == final.permission.view &&
      initial.permission.comment == final.permission.comment &&
      initial.permission.admin == final.permission.admin;
  }

  $scope.finalPermissions = {
    user: [],
    group: [],
    organization: []
  };

  // lists of entity ids to drop from permissions 
  // (where videoId = $scope.video.id)
  $scope.revokees = {
    user: [],
    group: [],
    organization: []
  };

  $scope.dismiss = function () {

    $scope.$dismiss();
    $state.go('video.comments');
  };

  $scope.deleteVideo = function() {
    $http.delete('/api/videos/'+$scope.video.id)
      .success(function (resp) {
            console.log('video deleted');
            $state.go('dash');
  //          $modalInstance.dismiss('cancel');
      })
      .error(function (error) {
        console.error('error deleting video', error);
      });
  };

  $scope.go = function (tab) {
    $state.go('video.comments.settings.tab', {tab:tab});
  };

  $scope.getGroups = function (query) {
    console.log('getGroups::query:', query);
    console.log(User.user.id);
    return $http.get('/api/groups/' + User.user.id + '/' + query)
      .then(function (response) {
        console.log(response.data, $scope.initialPermissions.group);
        return response.data.filter((group) => {
          for (var i = 0; i < $scope.initialPermissions.group.length; i++) {
            if ($scope.initialPermissions.group[i].entity.id == group.id) {
              return false;
            }
          }
          return true;
        });
      });
  };

  $scope.getOrgs = function (query) {
    console.log('getOrgs::query:', query);
    console.log(User.user.id);
    return $http.get('/api/orgs/' + User.user.id + '/' + query)
      .then(function (response) {
        console.log(response);
        return response.data.filter((org) => {
          for (var i = 0; i < $scope.initialPermissions.organization.length; i++) {
            if ($scope.initialPermissions.organization[i].entity.id == org.id) {
              return false;
            }
          }
          return true;
        });
      });
  };

  $scope.getUsernames = function (query) {
    console.log('getUsernames::query:', query);
    return $http.get('/api/users/' + query)
      .then(function (response) {
        console.log(response.data);
        return response.data.filter((item) => {
          return item.id != $scope.userId;
        });
      });
  };

  $scope.save = function () {
    console.log('save the settings for the video');

    // for each entity type, first perform revokations, then add
    Videos.removeEntitiesPermissionsFromVideo($scope.video.id, $scope.revokees);
    Object.keys($scope.finalPermissions).forEach((entityType) => {
      console.log($scope.finalPermissions[entityType]);
      $scope.finalPermissions[entityType].forEach((entityPermission) => {
        if (entityPermission.hasOwnProperty('new') && entityPermission.new) {
          Videos.addEntityPermissionsToVideo($scope.video.id, entityPermission);
        } else if (entityPermission.modified) {
          Videos.updateEntityPermissionsToVideo($scope.video.id, entityPermission);
        }
      });
    });

    $scope.dismiss();
  };

});
