'use strict';

angular.module('youScriberApp').controller('ManageCtrl', function ($scope, User) {
  $scope.membershipPermissions = User.user.managementPerms;
  console.log(User.user);
});
