angular.module('youScriberApp').directive('comment', function ($stateParams) {
  return {
    restrict: 'E',
    scope: { 
      'timecomment': '=model',
      'idx': '='
    },
    replace: true,
    templateUrl: 'views/directives/comment.html',
    link: function (scope, elem, attrs) {
      // console.log(elem.offset().top);
      function scrollIt() {
        var arbitraryOffset = 149;
        if ($stateParams.hasOwnProperty('commentId') && scope.timecomment.id==$stateParams.commentId) {
          // console.log(elem);
          // console.log(elem.offset().top);
          // console.log($('table.comments'));
          $('.active-comment').removeClass('active-comment');
          elem.addClass('active-comment');
          $('div.comments-col').scrollTop(elem.offset().top-arbitraryOffset);
        }
      }

      scrollIt();

      scope.$watch($stateParams.commentId, function(){
        scrollIt();
      });
    }
  }
});