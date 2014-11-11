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
  'angular-md5',
  'ngEnter'
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
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      // .when('/login', {
      //   redirectTo: '/login/student'
      // })
      .when('/register/org', {
        templateUrl: 'views/org-registration.html',
        controller: 'OrganizationRegistrationCtrl'
      })
      .when('/register/group', {
        templateUrl: 'views/group-registration.html',
        controller: 'GroupRegistrationCtrl'
      })
      // .when('/register/:org', {
      //   templateUrl: 'views/registration.html',
      //   controller: 'RegistrationCtrl'
      // })
      .when('/manage', {
        templateUrl: 'views/manage.html',
        controller: 'ManageCtrl'
      })
      .otherwise({
        redirectTo: '/dash'
      });
  })
  .run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  });
