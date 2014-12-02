'use strict';

angular.module('youScriberApp').controller('RegistrationCtrl', function ($scope, $routeParams, md5, $location, User) {

  if ($routeParams.hasOwnProperty('org')) {

  }
  var registrationCtrlScope = $scope;

  $scope.username = '';
  $scope.email = '';
  $scope.password = '';
  $scope.pwHash = '';
  $scope.errorMessage = '';
  $scope.userExists = false;

  $scope.$watch('password', function(newVal){
    $scope.pwHash = md5.createHash(newVal);
  });

  $scope.register = function() {
    if (!$scope.email || $scope.email === null || $scope.email.length < 5) {
      $scope.errorMessage = 'please enter a valid email address.';
      return;
    }
    else if (!$scope.hasOwnProperty('password') || !$scope.password || $scope.password === null || $scope.password.length == 0) {
      $scope.errorMessage = 'please enter a password.';
      return;
    }
    console.log($scope.username, $scope.email, $scope.pwHash);
    $scope.userExists = false;
    $scope.errorMessage = '';
    User.register($scope.username, $scope.email, $scope.pwHash, 
      function(data) {
        console.log('registered!');
        $location.path('/dash');
      }, 
      function(error) {
        if (error.hasOwnProperty('msg') && error.msg == 'username already exists') {
          registrationCtrlScope.userExists = true;
          registrationCtrlScope.errorMessage = error.msg;
        }
        console.log('err', error);
      });
  };

});
