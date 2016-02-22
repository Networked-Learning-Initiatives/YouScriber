'use strict';
angular.module('youScriberApp').service('Player', function ($rootScope, $window) {
  
  var playerScope = this;
  
  this.playerId = Math.floor(Math.random()*10000000);
  this.player = false;

  this.getCurrentTime = function() {
    if (this.player && this.player.hasOwnProperty('getCurrentTime')) {
      return this.player.getCurrentTime();
    } else {
      // console.error('no player in getCurrentTime');
      return 0;
    }
  };

  // https://developers.google.com/youtube/js_api_reference#Playback_status

  this.isPlaying = function () {
    return this.player && this.player.getPlayerState() === 1;
  }

  this.isPause = function () {
    return this.player && this.player.getPlayerState() === 2;
  }

  this.playVideo = function() {
    if (this.player) {
      return this.player.playVideo();
    } else {
      console.error('no player in playVideo');
    }
  };

  this.pauseVideo = function() {
    if (this.player) {
      return this.player.pauseVideo();
    } else {
      console.error('no player in pauseVideo');
    }
  };

  this.seekTo = function(t) {
    if (this.player && this.player.hasOwnProperty('seekTo')) {
      this.player.seekTo(t, true);
      $('textarea#comment').focus(); //is this the best?
    } else {
      this.seekTime = t;
      console.error('no player in seekTo');
    }
  };

  $rootScope.$on('seek-to', function(evt, t){
    playerScope.seekTo(t);
  });


  $window.onYouTubePlayerReady = function (id) {
    playerScope.player = document.getElementById('ytPlayer-'+playerScope.playerId);
    if (playerScope.hasOwnProperty('seekTime')) {
      console.log('need initial seek!', playerScope.seekTime);
      playerScope.player.seekTo(playerScope.seekTime);
      delete playerScope.seekTime;
    }
    playerScope.player.playVideo();
  };
});