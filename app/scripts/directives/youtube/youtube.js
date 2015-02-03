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
      
      scope.destroyWatch = scope.$watch('code', function (newVal) {
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

        scope.$on('$destroy', function(){
          if (scope.hasOwnProperty('timer') && scope.timer) {
            $interval.cancel(scope.timer);
          }
          if (scope.hasOwnProperty('destroyWatch')) {
            console.log('destroy the watch for the yt video code');
            scope.destroyWatch();
          }

          if (scope.hasOwnProperty('atts') && scope.atts.hasOwnProperty('id')) {
            console.log('have player id will destroy');
            swfobject.removeSWF(scope.atts.id);
          }
        });

        console.log('about to create this friggin video!');
        console.log(scope.atts);
        swfobject.createSWF(scope.atts, scope.params, "swf-container");
        scope.timer = $interval(function(){
          // console.log('timer went off');
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