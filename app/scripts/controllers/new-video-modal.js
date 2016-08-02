/* global angular */
'use strict'

angular.module('youScriberApp').controller('NewVideoModalCtrl', function ($scope, $modalInstance) {
  $scope.modal = {
    videoId: ''
  }

  $scope.modalMakeVideo = function () {
    console.log('modalMakeVideo')
    console.log($scope.modal.videoId)
    var videoIdStartIndex = $scope.modal.videoId.lastIndexOf('/')
    if (videoIdStartIndex >= 0) {
      $scope.modal.videoId = $scope.modal.videoId.substr(videoIdStartIndex + 1)
    }

    if ($scope.modal.videoId.length === 0) {
      $scope.errorMessage = 'Invalid videoId'
    // $modalInstance.dismiss($scope.errorMessage)
    } else {
      var wrongPrefix = 'watch?v='
      console.log($scope.modal.videoId.substr(0, wrongPrefix.length))
      if ($scope.modal.videoId.substr(0, wrongPrefix.length) === wrongPrefix) {
        $scope.modal.videoId = $scope.modal.videoId.substr(wrongPrefix.length)
      }
      $modalInstance.close($scope.modal.videoId)
    }
  }

  $scope.dismiss = function () {
    $modalInstance.dismiss()
  }
})
