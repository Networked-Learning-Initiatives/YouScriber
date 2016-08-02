/* global angular */
angular.module('youScriberApp').directive('videoPanel', function ($location) {
  return {
    restrict: 'E',
    scope: {
      video: '=model',
      videoId: '=videoId'
    },
    replace: true,
    templateUrl: 'views/directives/video-panel.html',
    link: function (scope, iElement, iAttrs, controller) {
      // scope.nav = function() {
      //   $location.path('video/'+scope.video.id)
      // }
    }
  }
})
