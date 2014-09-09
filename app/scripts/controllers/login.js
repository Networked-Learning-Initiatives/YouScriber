'use strict';

angular.module('youScriberApp').controller('LoginCtrl', function ($scope, $routeParams, md5, $location, User) {

  var loginCtrlScope = $scope;

  $scope.username = '';
  
  $scope.password = '';
  $scope.pwHash = '';
  $scope.errorMessage = '';

  $scope.$watch('password', function(newVal){
    $scope.pwHash = md5.createHash(newVal);
  });

  $scope.login = function() {
    if (!$scope.hasOwnProperty('username') || !$scope.username || $scope.username === null || $scope.username.length == 0) {
      $scope.errorMessage = 'please enter your username';
      return;
    }
    else if (!$scope.hasOwnProperty('password') || !$scope.password || $scope.password === null || $scope.password.length == 0) {
      $scope.errorMessage = 'please enter your password';
      return;
    }
    console.log($scope.username, $scope.pwHash);
    $scope.errorMessage = '';
    User.login($scope.username, $scope.pwHash, 
      function(data) {
        console.log('loggedin!', data);
        $location.path('/dash');
      }, 
      function(error) {
        if (error.hasOwnProperty('msg')) {
          loginCtrlScope.errorMessage = error.msg;
        }
        console.log('err', error);
      });
  };

});
