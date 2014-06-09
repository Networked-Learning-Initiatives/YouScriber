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
      .when('/', {
        redirectTo: '/jofNR_WkoCE'
      })
      .when('/:videoId', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
