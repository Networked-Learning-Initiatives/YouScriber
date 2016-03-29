angular.module('youScriberApp').directive('enterSubmit', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
     
      elem.bind('keydown', function(event) {
        var code = event.keyCode || event.which;
                
        if (code === 13) {
          if (!event.shiftKey) {
            event.preventDefault();
            // console.log(scope);
            // console.log(attrs.enterSubmit);
            scope.$apply(attrs.enterSubmit);
          }
        }
      });
    }
  }
});