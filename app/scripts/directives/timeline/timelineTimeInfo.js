angular.module('youScriberApp').directive('timelineTimeInfo', function($document, Player) {
  return {
    restrict: 'E',
    scope: { 
      time: '=',    
      duration: '=',
    },
    replace: true,
    templateUrl: 'views/directives/timelineTimeInfo.html',
    link: function (scope, iElement, iAttrs, controller) {

      var startX = 0, x = 0;

      scope.style = {
        top: 0,
        left: 0 - (iElement.width()/2),
      };

      // iElement.on('click', function(){

      // Auto-scrolls seekBar circle in sync with video.
      scope.$watch('time', function(newValue, oldValue) {
        //console.log(newValue);
        iElement.position(newValue, oldValue);
      });
    }
  };
});