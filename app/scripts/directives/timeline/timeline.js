/* global angular */
'use strict'
angular.module('youScriberApp').directive('timeline', function ($location, $rootScope) {
  return {
    restrict: 'E',
    scope: {
      comments: '=',
      duration: '=',
      width: '=',
      time: '='
    },
    replace: true,
    templateUrl: 'views/directives/timeline.html',
    link: function (scope, iElement, iAttrs, controller) {
      scope.Math = window.Math
      scope.seekToComment = function (t, evt) {
        evt.preventDefault()
        $rootScope.$emit('seek-to', t)
      }

      scope.seekToPosition = function (evt) {
        $rootScope.$emit('seek-to', evt.offsetX / scope.width * scope.duration)
      }

      scope.isCurrentComment = function (comment) {
        var delta = scope.time - comment.time
        var result = delta >= 0 && delta < 1.3
        return result
      }
    }
  }
}).filter('secondsfilter', function () {
  return function (input) {
    if (input) {
      input = input.toString()
      return input.toHHMMSS()
    }
    return input
  }
})
