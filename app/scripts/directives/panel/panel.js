angular.module('youScriberApp').directive('panel', function($location) {
  return {
    restrict: 'E',
    scope: { 
      panelTitle: '=panelTitle',
      footer: '='
    },
    transclude: true,
    replace: true,
    templateUrl: 'views/directives/panel.html',
    link: function (scope, iElement, iAttrs, controller) {
      // console.log(iAttrs);
      scope.panelTitle = iAttrs.panelTitle;
    }
  };
});