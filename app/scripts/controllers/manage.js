'use strict';

angular.module('youScriberApp').controller('ManageCtrl', function ($scope, User) {
  $scope.initialPermissions = User.user.managementPerms;
  $scope.finalPermissions = [];

  // $scope.tabs = {
  //   test: true,
  //   ICG: false,
  // };

  console.log($scope.initialPermissions);
});
