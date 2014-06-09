angular.module('youtubeapi',[]).directive('youtube', function($sce, $location, $interval) {
  return {
    restrict: 'EA',
    scope: { 
      code: '=videoId',
      width: '=w',
      height: '=h',
      playerId: '=playerId',
      time: '='
    },
    replace: true,
    templateUrl: 'scripts/directives/youtube/youtube.html',
    compile: function(tElement, tAttrs) {
      return function (scope, iElement, iAttrs, controller) {
        var el = document.getElementById('youtube-player-' + scope.playerId);
        // Lets Flash from another domain call JavaScript
        scope.params = { allowScriptAccess: "always" };
        // The element id of the Flash embed
        scope.atts = { 
          id: "ytPlayer-"+scope.playerId, 
          data: "https://www.youtube.com/v/" + scope.code + "?version=3&enablejsapi=1&playerapiid="+scope.playerId,
          width: scope.width,
          height: scope.height
        };
        
        scope.$watch('code', function (newVal) {
          $interval.cancel(scope.timer);
          angular.element('#video-container').append(angular.element('<div id="swf-container"></div>'));
          // Lets Flash from another domain call JavaScript
          scope.params = { allowScriptAccess: "always" };
          // The element id of the Flash embed
          scope.atts = { 
            id: "ytPlayer-"+scope.playerId, 
            data: "https://www.youtube.com/v/" + scope.code + "?version=3&enablejsapi=1&playerapiid="+scope.playerId,
            width: scope.width,
            height: scope.height
          };

          $location.path(scope.code);

          swfobject.createSWF(scope.atts, scope.params, "swf-container");
          scope.timer = $interval(function(){
            var el = $('#ytPlayer-'+scope.playerId)[0];
            if (el && el.hasOwnProperty('getCurrentTime')){
              var t = el.getCurrentTime();
              if (t>0) {
                scope.time = t;
              }
            }
          }, 100);
        });
      }
    }
  };
});