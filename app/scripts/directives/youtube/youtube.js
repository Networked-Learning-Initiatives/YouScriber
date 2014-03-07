angular.module('youtubeapi',[]).directive('youtube', function($sce) {
  return {
    restrict: 'EA',
    scope: { 
      code: '=videoId',
      width: '=w',
      height: '=h',
      playerId: '=playerId'
    },
    replace: true,
    compile: function(tElement, tAttrs) {
      return function (scope, iElement, iAttrs, controller) {
        var el = document.getElementById('youtube-player-' + scope.playerId);
        // Lets Flash from another domain call JavaScript
        scope.params = { allowScriptAccess: "always" };
        // The element id of the Flash embed
        scope.atts = { id: "ytPlayer-"+scope.playerId };

        swfobject.embedSWF("https://www.youtube.com/v/" + scope.code + "?version=3&enablejsapi=1&playerapiid="+scope.playerId, tElement[0], scope.width, scope.height);

        scope.$watch('code', function (newVal) {
          if (newVal) {
            scope.url = $sce.trustAsResourceUrl("https://www.youtube.com/v/" + newVal + "?version=3&enablejsapi=1&playerapiid="+scope.playerId);
            swfobject.embedSWF(scope.url, tElement[0], scope.width, scope.height, 10.0, null, null, scope.params, scope.atts);
          }
        });
      }
    }
  };
});