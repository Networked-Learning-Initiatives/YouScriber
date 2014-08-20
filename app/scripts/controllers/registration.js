'use strict';

angular.module('youScriberApp').controller('RegistrationCtrl', function ($scope, $routeParams, md5) {

  if ($routeParams.hasOwnProperty('org')) {

  }

  $scope.username = '';
  $scope.email = '';
  $scope.password = '';
  $scope.pwHash = '';

  $scope.$watch('password', function(newVal){
    $scope.pwHash = md5.createHash(newVal);
  });

});
