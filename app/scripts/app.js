'use strict';

angular.module('youScriberApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'youtubeapi',
  'firebase'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/dash', {
        templateUrl: 'views/dash.html',
        controller: 'DashCtrl'
      })
      .when('/video/:videoId', {
        templateUrl: 'views/video.html',
        controller: 'VideoCtrl'
      })
      .otherwise({
        redirectTo: '/dash'
      });
  });
