'use strict';

angular.module('youScriberApp').controller('DashCtrl', function ($scope, $firebase, $location, User) {
  var videosRef = new Firebase("https://amber-fire-1732.firebaseio.com/videos");

  var dashScope = $scope;

  $scope.userService = User;
  
  $scope.videos = $firebase(videosRef);
  
  $scope.newVideo = function() {
    console.log('hey');
    $('#new-video-modal').on('shown.bs.modal', function (e) {
      $('#inputVideoId').focus();
    });
    $('#new-video-modal').modal('show');
  };

  $scope.newVideoId = '';
  $scope.errorMessage = '';

  $scope.loadVideo = function() {
    console.log($scope.newVideoId);
    var videoIdStartIndex = $scope.newVideoId.lastIndexOf('/');
    if (videoIdStartIndex >= 0) {
      $scope.newVideoId = $scope.newVideoId.substr(videoIdStartIndex+1);
    }

    if ($scope.newVideoId.length == 0) {
      $scope.errorMessage = 'Invalid videoId';
    }
    else {
      $('#new-video-modal').modal('hide');
      $('#new-video-modal').on('hidden.bs.modal', function (e) {
        $location.path('/video/'+dashScope.newVideoId);
      });
    }
  };

});
