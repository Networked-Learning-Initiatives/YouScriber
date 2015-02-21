angular.module('youScriberApp').directive('timelineCircle', function($document, Player) {
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

      var startX = 0, x = 0;

      var isDragging = false;

      scope.style = {
        top: 0,
        left: 0 - (iElement.width()/2),
      };

      iElement.on('mousedown', function(event) {
      // Prevent default dragging of selected content
        isDragging = true;
        event.preventDefault();
        startX = event.pageX - x;
        // startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        // y = event.pageY - startY;
        x = event.pageX - startX;
        if (x > scope.width) {
          x = scope.width;
        }
        if (x < 0) {
          x = 0;
        }
        iElement.css({
          left:  x - (iElement.width()/2) + 'px' 
        });
      }

      function mouseup() {
        isDragging=false;
        Player.seekTo((x/scope.width)*scope.duration);
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
        console.log(iElement.position());
      }

      // iElement.on('click', function(){

      // })
      // scope.Math = window.Math;
      // scope.seekToComment = function(t, evt) {
      //   evt.preventDefault();
      //   $rootScope.$emit('seek-to', t);
      // };

      // scope.seekToPosition = function(evt){
      //   console.log(evt);

      // };

      // scope.isCurrentComment = function(comment){
      //   var delta = scope.time - comment.time;
      //   var result = 0<=delta && delta < 1.3;
      //   return result;
      // };

      // Auto-scrolls seekBar circle in sync with video.
      scope.$watch('time', function(newValue, oldValue) {
        //console.log(newValue);
        //console.log(scope.duration);
        //console.log(newValue/scope.duration);
        //console.log(iElement.position
        //console.log(iElement.width()); 
        iElement.position(newValue, oldValue);
        
        if (!isDragging) {
          scope.style.left=newValue/scope.duration*scope.width - (iElement.width()/2) +'px';
        }
      });
    }
  };
});