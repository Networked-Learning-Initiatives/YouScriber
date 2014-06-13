'use strict';

angular.module('youScriberApp').controller('DashCtrl', function ($scope, $firebase) {
  var videosRef = new Firebase("https://amber-fire-1732.firebaseio.com/videos");
  $scope.videos = $firebase(videosRef);
});
