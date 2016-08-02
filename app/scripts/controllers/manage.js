/* global angular */
'use strict'

angular.module('youScriberApp').controller('ManageCtrl', function ($scope, User) {
  $scope.initialPermissions = User.user.managementPerms
  $scope.finalPermissions = []

  console.log($scope.initialPermissions)
})
