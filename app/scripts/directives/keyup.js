angular.module('youScriberApp').directive('keyup', function () {
  return {
    restrict: 'A',
    scope: {
      keyup: '='
    },
    link: function (scope, elem, attrs) {
     
      var findContentEditableParent = function (element) {
        if (element.tagName && element.tagName.match(/body/i)) return null;
        if (element.attr('contenteditable')) {
          return element;
        }
        else if (angular.element(element.parentNode).attr('contenteditable') ) {
          return element.parentNode;
        } else {
          return findContentEditableParent(element.parentNode);
        }
      };
      var theEditableElem = findContentEditableParent(elem);
      theEditableElem.bind('keyup', function(event) {
        var code = event.keyCode || event.which;
                
        if (code !== 13) {
          // console.log('theEditableElem.keyup');
          if (attrs && attrs.hasOwnProperty('keyup')) {
            // console.log(attrs.keyup);
            // console.log(scope.$parent.$parent);
            scope.$parent.$parent.$apply(attrs.keyup);
            // attrs.keyup();
          }
        }
      });
    }
  }
});