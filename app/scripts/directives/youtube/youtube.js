angular.module('youtubeapi', []).directive('ysYoutube', function($sce, $location, $interval, $resource) {
  return {
    restrict: 'E',
    scope: { 
      code: '=videoId',
      width: '=w',
      height: '=h',
      playerId: '=playerId',
      time: '='
      // videoMetadata: '=metadata'
    },
    replace: true,
    templateUrl: 'views/directives/youtube.html',
    link: function (scope, iElement, iAttrs, controller) {
      var el = document.getElementById('youtube-player-' + scope.playerId);
      // Lets Flash from another domain call JavaScript
      scope.params = { allowScriptAccess: "always" };
      // The element id of the Flash embed
      scope.atts = { 
        id: "ytPlayer-"+scope.playerId, 
        data: "https://www.youtube.com/v/" + scope.code + "?version=3&controls=0&enablejsapi=1&playerapiid="+scope.playerId,
        width: scope.width,
        height: scope.height
      };

      var Videos = $resource('http://gdata.youtube.com/feeds/api/videos/:videoid?v=2&alt=json', {query:'@query'});
      scope.videoMetadata = Videos.get({videoid:scope.code});
      
      scope.$watch('code', function (newVal) {
        console.log('video code change noticed in yt directive', newVal);
        if (scope.hasOwnProperty('timer')) {
          $interval.cancel(scope.timer);
        }
        if (typeof newVal === "undefined") {
          return;
        }
        angular.element('#video-container').append(angular.element('<div id="swf-container"></div>'));
        // Lets Flash from another domain call JavaScript
        scope.params = { allowScriptAccess: "always" };
        // The element id of the Flash embed
        scope.atts = { 
          id: "ytPlayer-"+scope.playerId, 
          data: "https://www.youtube.com/v/" + scope.code + "?version=3&controls=0&enablejsapi=1&playerapiid="+scope.playerId,
          width: scope.width,
          height: scope.height
        };

        swfobject.createSWF(scope.atts, scope.params, "swf-container");
        scope.timer = $interval(function(){
          console.log('timer went off');
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
  };
});