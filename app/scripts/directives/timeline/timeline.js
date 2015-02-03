angular.module('youScriberApp').directive('timeline', function($location, $rootScope) {
  return {
    restrict: 'E',
    scope: { 
      comments: '=',
      duration: '=',
      width: '=',
      time: '='
    },
    replace: true,
    templateUrl: 'views/directives/timeline.html',
    link: function (scope, iElement, iAttrs, controller) {
      scope.Math = window.Math;
      scope.seekToComment = function(t, evt) {
        evt.preventDefault();
        $rootScope.$emit('seek-to', t);
      };

      scope.seekToPosition = function(evt){
        console.log(evt);

      };

      scope.isCurrentComment = function(comment){
        var delta = scope.time - comment.time;
        var result = 0<=delta && delta < 1.3;
        return result;
      };
      scope.$watch('time', function(newValue, oldValue) {
        console.log('timeupdated!', newValue, oldValue);
      });
    }
  };
}).filter('secondsfilter', function() {
  return function(input) {
    if (input) {
      input = input.toString();
      return input.toHHMMSS();
    }
    return input;
  };
});