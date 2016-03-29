angular.module('youScriberApp').directive('keyup', function () {
  return {
    restrict: 'A',
    // scope: {
    //   keyup: '='
    // },
    link: function (scope, elem, attrs) {
     console.log(elem);
     console.log(scope);
      // var findContentEditableParent = function (element) {
      //   if (element && element.tagName && element.tagName.match(/body/i)) return null;
      //   if (element && element.attr('contenteditable')) {
      //     return element;
      //   }
      //   else if (element && angular.element(element.parentNode).attr('contenteditable') ) {
      //     return element.parentNode;
      //   } else {
      //     return findContentEditableParent(element.parentNode);
      //   }
      // };
      // var theEditableElem = findContentEditableParent(elem);
      elem.bind('keyup', function(event) {
        var code = event.keyCode || event.which;
                
        if (code !== 13) {
          // console.log('theEditableElem.keyup');
          if (attrs && attrs.hasOwnProperty('keyup')) {
            // console.log(attrs.keyup);
            // console.log(scope.$parent.$parent);
            scope.$apply(attrs.keyup);
            // attrs.keyup();
          }
        }
      });
    }
  }
});