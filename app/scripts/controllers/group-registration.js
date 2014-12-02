'use strict';

angular.module('youScriberApp').controller('GroupRegistrationCtrl', function ($scope, $routeParams, md5, $location, User) {

  var groupRegistrationCtrlScope = $scope;

  $scope.title = '';
  $scope.description = '';
  $scope.errorMessage = '';
  $scope.groupExists = false;

  console.log($routeParams);

  $scope.registerGroup = function() {
    if (!$scope.title || $scope.title === null || $scope.title.length < 1) {
      $scope.errorMessage = 'please enter a title.';
      return;
    }
    console.log($scope.title, $scope.description);
    $scope.groupExists = false;
    $scope.errorMessage = '';
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
  };

});
