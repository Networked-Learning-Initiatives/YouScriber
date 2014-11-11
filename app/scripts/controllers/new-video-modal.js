'use strict';

angular.module('youScriberApp').controller('NewVideoModalCtrl', function ($scope, $modalInstance) {

  $scope.modal = {
    videoId : ''
  };

  $scope.modalMakeVideo = function () {
    console.log("modalMakeVideo");
    console.log($scope.modal.videoId);
    var videoIdStartIndex = $scope.modal.videoId.lastIndexOf('/');
    if (videoIdStartIndex >= 0) {
      $scope.modal.videoId = $scope.modal.videoId.substr(videoIdStartIndex+1);
    }

    if ($scope.modal.videoId.length == 0) {

      $scope.errorMessage = 'Invalid videoId';
      // $modalInstance.dismiss($scope.errorMessage);
    }
    else {
      $modalInstance.close($scope.modal.videoId);

      // $('#new-video-modal').modal('hide');
      // $('#new-video-modal').on('hidden.bs.modal', function (e) {
      //   console.log('go to the new video');
      //   // dashScope.$apply($location.path('/video/'+dashScope.newVideoId));
      //   dashScope.videosService.newVideo(dashScope.newVideoId);
      // });
    }
  };

  $scope.dismiss = function() {
    $modalInstance.dismiss();
  };

});