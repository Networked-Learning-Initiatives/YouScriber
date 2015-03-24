'use strict';

angular.module('youScriberApp').controller('VideoSettings', function ($scope, $http, User, video, Videos) {
  $scope.usernameSelected = '';

  $scope.video = video;

  // remember the initial permissions so we can diff when they save
  $scope.initialPermissions = {};
  // for (var permGroup in $scope.video.permissions) {
  Object.keys($scope.video.permissions).forEach(function (permGroup) {

    // });
    $scope.initialPermissions[permGroup] = {};
    // for (var entity in $scope.video.permissions[permGroup]) {
    Object.keys($scope.video.permissions[permGroup]).forEach(function (entity) {

      $scope.initialPermissions[permGroup][entity] = {};
      // for (var perm in $scope.video.permissions[permGroup][entity]) {
      Object.keys($scope.video.permissions[permGroup][entity]).forEach(function (perm) {
        $scope.initialPermissions[permGroup][entity][perm] = $scope.video.permissions[permGroup][entity][perm];
      });
    });
  });

  var defaultPermissionsForNewUser = {
    read: true,
    author: false,
    edit: false,
    delete: false
  };

  $scope.newUserPermissions = {
    read: true,
    author: false,
    edit: false,
    delete: false
  };

  $scope.dismiss = function () {

    $scope.$dismiss();
  };

  $scope.getUsernames = function (query) {
    console.log('getUsernames::query:', query);
    return $http.get('/api/users/' + query)
      .then(function (response) {
        // console.log(response);
        // // return [];
        // var results = response.data.map(function(thisUser){
        //   console.log(thisUser);
        //   console.log(thisUser.name);
        //   var uname = thisUser.name;
        //   return uname; //TODO: eventually return icon/avatar here?
        // });
        // console.log(results);
        // return results;
        return response.data;
      });
  };

  $scope.save = function () {
    console.log('save the settings for the video');

    // loop over the new permissions' permgroups' entities, 
    // if the key is in inital, compare within, 
    // if not, add the permissions

    //for (var permGroup in $scope.video.permissions) {
    Object.keys($scope.video.permissions).forEach(function (permGroup) {
      // check $scope.initialPermissions for entities not in new to queue for deletion
      var entityRemovals = [];
      for (var initialEntity in $scope.initialPermissions[permGroup]) {
        if (!(initialEntity in $scope.video.permissions[permGroup])) {
          entityRemovals.push({name:initialEntity, id:$scope.initialPermissions[permGroup][initialEntity].id});
        }
      }
      if (entityRemovals.length > 0) {
        // tell the server to drop those entities' permissions
        Videos.removeEntitiesPermissionsFromVideo(video.id, entityRemovals, permGroup);
      }
      for (var entity in $scope.video.permissions[permGroup]) {
        // console.log()
        if (entity in $scope.initialPermissions[permGroup]) {
          var entityPermissionChanges = [];
          for (var perm in $scope.video.permissions[permGroup][entity]) {
            if ($scope.video.permissions[permGroup][entity][perm] !== $scope.initialPermissions[permGroup][entity][perm]) {
              var change = {};
              change[perm] = $scope.video.permissions[permGroup][entity][perm];
              entityPermissionChanges.push(change);
            }
          }
          if (entityPermissionChanges.length > 0) {
            //tell the server to make these changes
            Videos.updateEntityPermissionsToVideo({name:entity, id:$scope.video.permissions[permGroup][entity].id}, permGroup, video.id, entityPermissionChanges);
          }
        } else {
          // new entity gets permissions
          // tell server to add {entity: $scope.video.permissions[permGroup][entity]}
          var entityPermissionAdditions = [];
          for (var perm in $scope.video.permissions[permGroup][entity]) {
            if (perm != 'id' && $scope.video.permissions[permGroup][entity][perm] &&
              (!(entity in $scope.initialPermissions[permGroup])
              || !(perm in $scope.initialPermissions[permGroup][entity]) 
              || $scope.video.permissions[permGroup][entity][perm] !== $scope.initialPermissions[permGroup][entity][perm])) {
              var change = {};
              change[perm] = $scope.video.permissions[permGroup][entity][perm];
              entityPermissionAdditions.push(change);
            }
          }
          if (entityPermissionAdditions.length > 0) {
            Videos.addEntityPermissionsToVideo({name:entity, id:$scope.video.permissions[permGroup][entity].id}, permGroup, video.id, entityPermissionAdditions);
          }
        }
      }
    });

    $scope.dismiss();
  };

  $scope.keys = Object.keys;

  // $scope.videoService = Videos;

  $scope.revokeAll = function(permGroup, entity) {
    console.log($scope.video.permissions);
    console.log(permGroup);
    console.log(entity);
    delete $scope.video.permissions[permGroup][entity];
    //idk
  };

  $scope.addNewUserPermission = function() {
    // add the new permission to the current video.
    $scope.newUserPermissions.id=$scope.usernameSelected.id;
    video.permissions.users[$scope.usernameSelected.name] = $scope.newUserPermissions;

    // clear the UI so another user can be added.
    $scope.usernameSelected = '';
    $scope.newUserPermissions = defaultPermissionsForNewUser;
  };

  $scope.groupSelected = '';

  var defaultPermissionsForNewGroup = {
    read: true,
    author: false,
    edit: false,
    delete: false
  };

  $scope.newGroupPermissions = {
    read: true,
    author: false,
    edit: false,
    delete: false
  };

  $scope.getGroups = function (query) {
    console.log('getGroups::query:', query);
    console.log(User.getCurrentContext());
    return $http.get('/api/groups/'+User.getCurrentContext().id+'/'+query)
      .then(function(response){
        // console.log(response);
        // // return [];
        // var results = response.data.map(function(thisGroup){
        //   console.log(thisGroup);
        //   console.log(thisGroup.title);
        //   var groupName = thisGroup.title;
        //   return groupName; //TODO: eventually return icon/avatar here?
        // });
        // console.log(results);
        // return results;
        return response.data;
      });
  };

  $scope.addNewGroupPermission = function() {
    // add the new permission to the current video.
    $scope.newGroupPermissions.id=$scope.groupSelected.id;
    video.permissions.groups[$scope.groupSelected.title] = $scope.newGroupPermissions;

    // clear the UI so another user can be added.
    $scope.groupSelected = '';
    $scope.newGroupPermissions = defaultPermissionsForNewGroup;
  };

  $scope.orgSelected = '';

  var defaultPermissionsForNewOrg = {
    read: true,
    author: false,
    edit: false,
    delete: false
  };

  $scope.newOrgPermissions = {
    read: true,
    author: false,
    edit: false,
    delete: false
  };

  $scope.getOrgs = function (query) {
    console.log('getOrgs::query:', query);
    console.log(User.getCurrentContext());
    return $http.get('/api/orgs/'+User.getCurrentContext().id+'/'+query)
      .then(function(response){
        console.log(response);
        // return [];
        // var results = response.data.map(function(thisOrg){
        //   console.log(thisOrg);
        //   console.log(thisOrg.title);
        //   var orgName = thisOrg.title;
        //   return orgName; //TODO: eventually return icon/avatar here?
        // });
        // console.log(results);
        // return results;
        return response.data;
      });
  };

  $scope.addNewOrgPermission = function() {
    // add the new permission to the current video.
    console.log($scope.newOrgPermissions, $scope.orgSelected);
    $scope.newOrgPermissions.id=$scope.orgSelected.id;
    video.permissions.organizations[$scope.orgSelected.title] = $scope.newOrgPermissions;
    console.log(video.permissions.organizations[$scope.orgSelected.title]);

    // clear the UI so another user can be added.
    $scope.orgSelected = '';
    $scope.newOrgPermissions = defaultPermissionsForNewOrg;
  };

});
