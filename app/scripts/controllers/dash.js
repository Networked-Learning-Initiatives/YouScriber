'use strict';

angular.module('youScriberApp').controller('DashCtrl', function ($scope, $location, User, Videos, $modal, $timeout) {
  // var videosRef = new Firebase("https://amber-fire-1732.firebaseio.com/videos"); //need to get rid of firebase stuff
  var dashScope = $scope;

  $scope.userService = User;
  $scope.videosService = Videos;
  $scope.newVideoId = '';
  $scope.errorMessage = '';
  
  $scope.newVideo = function() {
    var modalInstance = $modal.open({
      templateUrl: '/views/new-video-modal.html',
      controller: 'NewVideoModalCtrl',
    });

    console.log(modalInstance);
    modalInstance.opened.then(function () {
      console.log('opened');
      $timeout(function () {
        console.log($('#inputVideoId'));
        $('#inputVideoId').focus();
      },200);
    });

    modalInstance.result.then(function(newVideoId) {
      $scope.newVideoId = newVideoId;
      $scope.loadVideo();
    }, function(errorMessage) {
      $scope.errorMessage = errorMessage;
    });
  };

  $scope.loadVideo = function() {
    console.log($scope.newVideoId);
    console.log('go to the new video');
    $scope.videosService.newVideo(dashScope.newVideoId);
  };

});
