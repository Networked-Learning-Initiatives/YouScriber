angular.module('youScriberApp').directive('navbar', function (User, Videos) {
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
      scope.query = "";
      scope.search = function() {
        console.log(scope.query);
        Videos.filter = scope.query;
      };
    }
  };
});