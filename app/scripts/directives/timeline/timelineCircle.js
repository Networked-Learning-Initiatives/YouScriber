/* global angular */
'use strict'

angular.module('youScriberApp')
  .directive('timelineCircle', function ($document, Player, $rootScope) {
    return {
      restrict: 'E',
      scope: {
        time: '=',
        duration: '=',
        width: '='
      },
      replace: true,
      templateUrl: 'views/directives/timelineCircle.html',
      link: function (scope, iElement, iAttrs, controller) {
        // var startX = 0, x = 0

        scope.isDragging = false

        scope.getLeft = function () {
          return scope.time / scope.duration * (scope.width - 24) + 'px'
        }

        scope.style = {
          top: '-2px',
          // left: '40px',
          left: '0px'
        }

        scope.$watch('time', function (newValue, oldValue, scope) {
          // console.log('time', newValue)
          if (!scope.isDragging) {
            scope.style = {
              top: '-2px',
              // left: '40px',
              left: scope.getLeft()
            }
          }
        })

        iElement.on('click', function (event) {
          console.log('circle click')
          event.stopPropagation()
        })

        iElement.on('mousedown', function (event) {
          $document.on('mousemove', mousemove)
          $document.on('mouseup', mouseup)
          event.stopPropagation()
          // Player.pauseVideo()
          // Prevent default dragging of selected content
          scope.isDragging = true
          scope.startDrag = {
            eventX: event.pageX,
            circleX: iElement.position().left
          }
          console.log(scope.startDrag)

          event.preventDefault()
        })

        function mousemove (event) {
          event.stopPropagation()
          if (scope.isDragging) {
            console.log('mousemove', scope.isDragging)
            console.log('mousemove', event)
            var delta = event.pageX - scope.startDrag.eventX
            var newLeft = scope.startDrag.circleX + delta + 'px'
            console.log(newLeft)
            iElement.css({
              left: newLeft
            })
          }
        }

        function mouseup (evt) {
          evt.stopPropagation()
          scope.isDragging = false
          delete scope.startDrag
          $document.off('mousemove', mousemove)
          $document.off('mouseup', mouseup)
          var newT = iElement.position().left / scope.width * scope.duration
          $rootScope.$emit('seek-to', newT)
          console.log(newT)
          console.log(iElement.position())
        }
      }
    }
  })
