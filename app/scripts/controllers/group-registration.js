'use strict';

angular.module('youScriberApp').controller('GroupRegistrationCtrl', function ($scope, $routeParams, md5, $location, User, $http) {

  var groupRegistrationCtrlScope = $scope;

  $scope.title = '';
  $scope.description = '';
  $scope.errorMessage = '';
  $scope.groupExists = false;
  $scope.groupSelected = '';
  $scope.loadingGroups = false;

  var CREATE_NEW_ID = -1;

  var NEW_TITLE_PREFIX = 'Create new group ("';
  var NEW_TITLE_SUFFFIX = '")';

  var CREATE_NEW_ENTITY = 

  groupRegistrationCtrlScope.newGroupTemplate = function (query) {
    return {
      newTitle: query,
      id: CREATE_NEW_ID,
      title: NEW_TITLE_PREFIX + query + NEW_TITLE_SUFFFIX
    };
  }

  $scope.getGroups = function (query) {
    console.log('getGroups::query:', query);
    console.log(User.getCurrentContext());
    return $http.get('/api/groups/search/'+User.getCurrentContext().id+'/'+query)
      .then(function(response){
        console.log(response);
        response.data.unshift(groupRegistrationCtrlScope.newGroupTemplate(query));
        return response.data;
      });
  };

  console.log($routeParams);

  $scope.registerGroup = function() {
    if (!$scope.title || $scope.title === null || $scope.title.length < 1) {
      $scope.errorMessage = 'please enter a title.';
      return;
    }
    console.log($scope.title, $scope.description);
    $scope.groupExists = false;
    $scope.errorMessage = '';
    if ($scope.groupSelected.id === CREATE_NEW_ID) {
      User.registerGroup($scope.title, $scope.description, 
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
    // console.log($scope.groupSelected);
    // console.log($item, $model, $label);
    // don't really need to do anythign until "save"
  };

});
