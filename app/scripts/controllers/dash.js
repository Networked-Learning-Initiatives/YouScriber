'use strict';

angular.module('youScriberApp').controller('DashCtrl', function ($scope, $firebase, $location, User, Videos) {
  var videosRef = new Firebase("https://amber-fire-1732.firebaseio.com/videos"); //need to get rid of firebase stuff
  var dashScope = $scope;

  $scope.userService = User;
  $scope.videosService = Videos;
  
  $scope.newVideo = function() {
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
        console.log('go to the new video');
        // dashScope.$apply($location.path('/video/'+dashScope.newVideoId));
        dashScope.videosService.newVideo(dashScope.newVideoId);
      });
    }
  };

});
