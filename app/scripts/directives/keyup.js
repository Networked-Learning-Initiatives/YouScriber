/* global angular */
angular.module('youScriberApp').directive('keyup', function () {
  return {
    restrict: 'A',
    // scope: {
    //   keyup: '='
    // },
    link: function (scope, elem, attrs) {
      elem.bind('keyup', function (event) {
        var code = event.keyCode || event.which

        if (code !== 13) {
          if (attrs && attrs.hasOwnProperty('keyup')) {
            scope.$apply(attrs.keyup)
          // attrs.keyup()
          }
        }
      })
    }
  }
})
