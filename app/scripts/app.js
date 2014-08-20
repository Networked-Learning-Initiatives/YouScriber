'use strict';

angular.module('youScriberApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'youtubeapi',
  'firebase',
  'xeditable',
  'ui.bootstrap',
  'angular-md5'
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
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegistrationCtrl'
      })
      .when('/register/:org', {
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl'
      })
      .otherwise({
        redirectTo: '/dash'
      });
  })
  .run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  });
