angular.module('youScriberApp').directive('comment', function ($stateParams, $rootScope, Player, $state) {
  return {
    restrict: 'E',
    scope: { 
      'timecomment': '=model',
      'idx': '='
    },
    replace: true,
    templateUrl: 'views/directives/comment.html',
    link: function (scope, elem, attrs) {
      scope.playerService = Player;
      // console.log(elem.offset().top);
      scope.scrollIt = function() {
        // console.log('scrollIt()', $stateParams);
        var arbitraryOffset = 149;
        if ($stateParams.hasOwnProperty('commentId') && scope.timecomment.id==$stateParams.commentId) {
          $('.active-comment').removeClass('active-comment');
          elem.addClass('active-comment');
          $('div.comments-col').scrollTop(elem.offset().top-arbitraryOffset);
          scope.seekTo();
        }
      };

      scope.seekTo = function() {
        // console.log('state.go video.comment with ', scope.timecomment.id);
        scope.playerService.seekTo(scope.timecomment.time);
        $state.go('video.comment', {commentId:scope.timecomment.id});        
      };

      scope.scrollIt();

      scope.$watch($stateParams.commentId, function(){
        scope.scrollIt();
      });

      scope.isCurrentComment = function(){
        var delta = scope.playerService.getCurrentTime() - scope.timecomment.time;
        return 0<=delta && delta < 1.3;
      };
    }
  }
});