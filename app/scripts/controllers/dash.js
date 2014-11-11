'use strict';

angular.module('youScriberApp').controller('DashCtrl', function ($scope, $location, User, Videos, $modal) {
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
      // resolve: {
      //   newVideoId: function() {
      //     return $scope.newVideoId;
      //   }
    });

    modalInstance.result.then(function(newVideoId) {
      $scope.newVideoId = newVideoId;
      $scope.loadVideo();
    }, function(errorMessage) {
      $scope.errorMessage = errorMessage;
    });


    // $('#new-video-modal').on('shown.bs.modal', function (e) {
    //   $('#inputVideoId').focus();
    // });
    // $('#new-video-modal').modal('show');
  };


  $scope.loadVideo = function() {
    console.log($scope.newVideoId);
    // var videoIdStartIndex = $scope.newVideoId.lastIndexOf('/');
    // if (videoIdStartIndex >= 0) {
    //   $scope.newVideoId = $scope.newVideoId.substr(videoIdStartIndex+1);
    // }

    // if ($scope.newVideoId.length == 0) {
    //   $scope.errorMessage = 'Invalid videoId';
    // }
    // else {
      // $('#new-video-modal').modal('hide');
      // $('#new-video-modal').on('hidden.bs.modal', function (e) {
        console.log('go to the new video');
        // dashScope.$apply($location.path('/video/'+dashScope.newVideoId));
        $scope.videosService.newVideo(dashScope.newVideoId);
      // });
    // }
  };

});
