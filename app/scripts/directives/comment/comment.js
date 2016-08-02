/* global angular $ */
angular.module('youScriberApp').directive('comment', function ($stateParams, $rootScope, Player, $state, Videos, $http, User) {
  return {
    restrict: 'E',
    scope: {
      'timecomment': '=model',
      'idx': '='
    },
    replace: true,
    templateUrl: 'views/directives/comment.html',
    link: function (scope, elem, attrs) {
      scope.playerService = Player
      // console.log(elem.offset().top)
      scope.scrollIt = function () {
        // console.log('scrollIt()', $stateParams)
        var arbitraryOffset = 149
        if ($stateParams.hasOwnProperty('commentId') && scope.timecomment.id === $stateParams.commentId) {
          $('.active-comment').removeClass('active-comment')
          elem.addClass('active-comment')
          $('div.comments-col').scrollTop(elem.offset().top - arbitraryOffset)
          scope.seekTo()
        }
      }

      scope.videosService = Videos

      scope.seekTo = function () {
        // console.log('state.go video.comment with ', scope.timecomment.id)
        scope.playerService.seekTo(scope.timecomment.time)
        $state.go('video.comment', {commentId: scope.timecomment.id})
      }

      scope.scrollIt()

      scope.updateTime = function () {
        console.log(scope.timecomment)
        $http.post('/api/comments/' + scope.timecomment.id + '/time', {time: scope.timecomment.time})
          .success(function (resp) {
            console.log('time updated')
          })
          .error(function (error) {
            console.error('error updating time', error)
          })
      }

      scope.updateContent = function () {
        console.log(scope.timecomment)
        $http.post('/api/comments/' + scope.timecomment.id + '/content', {content: scope.timecomment.content})
          .success(function (resp) {
            console.log('content updated')
          })
          .error(function (error) {
            console.error('error updating comment content', error)
          })
      }

      scope.delete = function () {
        console.log(scope.timecomment)
        Videos.currentVideo.comments.splice(scope.idx, 1)
        $http.post('/api/comments/' + scope.timecomment.id + '/delete', {user: User.user.id})
          .success(function (resp) {
            console.log('comment deleted')
          })
          .error(function (error) {
            console.error('error deleting comment', error)
          })
      }

      scope.$watch($stateParams.commentId, function () {
        scope.scrollIt()
      })

      scope.isCurrentComment = function () {
        var delta = scope.playerService.getCurrentTime() - scope.timecomment.time
        return delta >= 0 && delta < 1.3
      }
    }
  }
})
