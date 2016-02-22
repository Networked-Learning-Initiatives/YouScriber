'use strict';

angular.module('youScriberApp').controller('OrganizationRegistrationCtrl', function ($scope, $routeParams, md5, $location, User, $http) {

  var orgRegistrationCtrlScope = $scope;

  $scope.title = '';
  $scope.description = '';
  $scope.errorMessage = '';
  $scope.orgExists = false;
  $scope.orgSelected = '';

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
        User.user.orgs.push(data);
        console.log(User.user);
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

  $scope.getOrgs = function (query) {
    console.log('getOrgs::query:', query);
    return $http.get('/api/orgs/search/'+User.user.id+'/'+query)
      .then(function(response){
        console.log(response);
        return response.data;
      });
  };

});
