angular.module('youScriberApp').directive('videoPanel', function($location) {
  return {
    restrict: 'E',
    scope: { 
      video: '=model',
      videoId: '=videoId'
    },
    replace: true,
    templateUrl: 'scripts/directives/video-panel/panel.html',
    link: function (scope, iElement, iAttrs, controller) {
      scope.nav = function(video) {
        // console.log(video);
        $location.path('video/'+video);
      }; 
    }
  };
});