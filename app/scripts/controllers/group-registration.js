'use strict';

angular.module('youScriberApp').controller('GroupRegistrationCtrl', function ($scope, $routeParams, md5, $location, User, $http, $timeout) {

  var groupRegistrationCtrlScope = $scope;

  $scope.title = '';
  $scope.description = '';
  $scope.errorMessage = '';
  $scope.groupExists = false;
  $scope.groupSelected = '';
  $scope.loadingGroups = false;

  $scope.submitText = 'Submit';

  var CREATE_NEW_ID = -1;

  var NEW_TITLE_PREFIX = 'Create new group ("';
  var NEW_TITLE_SUFFFIX = '")';

  var CREATE_NEW_ENTITY = 

  groupRegistrationCtrlScope.newGroupTemplate = function (query) {
    return {
      newTitle: query,
      id: CREATE_NEW_ID,
      name: NEW_TITLE_PREFIX + query + NEW_TITLE_SUFFFIX
    };
  }

  $scope.checkNewGroupTitle = function () {
    return $http.get('/api/groups/search/'+User.user.id+'/'+$scope.title)
      .then(function(response){
        console.log(response);
        if (response && response.data && response.data.length > 0) {
          $scope.groupExists = true;
        } else {
          $scope.groupExists = false;
        }
      });
  };

  $scope.getGroups = function (query) {
    console.log('getGroups::query:', query);
    return $http.get('/api/groups/search/'+User.user.id+'/'+query)
      .then(function(response){
        console.log(response);
        response.data.unshift(groupRegistrationCtrlScope.newGroupTemplate(query));
        return response.data;
      });
  };

  console.log($routeParams);

  $scope.registerGroup = function() {
    console.log($scope.groupSelected);
    if (!$scope.groupSelected || !$scope.groupSelected.title || $scope.groupSelected.title === null || $scope.groupSelected.title.length < 1) {
      $scope.errorMessage = 'please enter a title.';
      return;
    }
    console.log($scope.groupSelected.title, $scope.description);
    $scope.groupExists = false;
    $scope.errorMessage = '';
    if ($scope.groupSelected.id === CREATE_NEW_ID) {
      console.log('creating new group');
      User.registerGroup($scope.groupSelected.title, $scope.description, 
        function(data) {
          console.log('registered new group!');
          User.user.groups.push(data);
          console.log(User.user);
          $location.path('/group/');
        }, 
        function(error) {
          if (error.hasOwnProperty('msg') && error.msg == 'username already exists') {
            registrationCtrlScope.groupExists = true;
            registrationCtrlScope.errorMessage = error.msg;
          }
          console.log('err', error);
        });
    } else { //join existing group
      User.joinGroup($scope.groupSelected.id);
    }
  };

  $scope.joinGroup = function ($item, $model, $label) {
    console.log('joinGroup', $item, $model, $label);
    if ($item.newTitle) {
      $item.title = $item.newTitle;
    }
    $timeout(function(){angular.element('#group-description').focus();});
    if ($item && $item.description) {
      $scope.description = $item.description;
      $scope.submitText = 'Join Existing Group';
    } else {
      $scope.submitText = 'Create New Group';
    }
    // console.log($scope.groupSelected);
    // console.log($item, $model, $label);
    // don't really need to do anythign until "save"
  };

});
