angular.module('youScriberApp').directive('navbar', function (User) {
  return {
    restrict: 'E',
    // scope: { 
    //   userService: '=',
    // },
    replace: true,
    templateUrl: 'views/directives/navbar.html',
    link: function (scope, elem, attrs) {
      scope.userService = User;

      scope.logout = function() {
        User.logout();
      };
    }
  };
});