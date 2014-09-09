'use strict';

angular.module('youScriberApp').controller('OrganizationRegistrationCtrl', function ($scope, $routeParams, md5, $location, User) {

  var orgRegistrationCtrlScope = $scope;

  $scope.title = '';
  $scope.description = '';
  $scope.errorMessage = '';
  $scope.orgExists = false;

  $scope.registerOrg = function() {
    if (!$scope.title || $scope.title === null || $scope.title.length < 1) {
      $scope.errorMessage = 'please enter a title.';
      return;
    }
    console.log($scope.title, $scope.description);
    $scope.orgExists = false;
    $scope.errorMessage = '';
    User.registerOrg($scope.title, $scope.description, 
      function(data) {
        console.log('registered new org!');
        $location.path('/org/');
      }, 
      function(error) {
        if (error.hasOwnProperty('msg') && error.msg == 'username already exists') {
          registrationCtrlScope.orgExists = true;
          registrationCtrlScope.errorMessage = error.msg;
        }
        console.log('err', error);
      });
  };

});
