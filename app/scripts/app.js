/* global angular */
'use strict'
angular.module('youScriberApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'youtubeapi',
  'xeditable',
  'ui.bootstrap',
  'angular-md5',
  'ngEnter',
  'ui.router',
  'focus-if',
  'angularTrix'
])
  .config(function ($stateProvider, $urlRouterProvider, $provide) {
    $urlRouterProvider.otherwise('/dash')
    $stateProvider
      .state('dash', {
        url: '/dash',
        templateUrl: 'views/dash.html',
        controller: 'DashCtrl'
      })
      .state('video', {
        url: '/video/:videoId',
        templateUrl: 'views/video.html',
        controller: 'VideoCtrl'
      })
      .state('video.comments', {
        // params: [],
        url: '/comments',
        templateUrl: 'views/comments.html',
        controller: 'CommentsCtrl'
      })
      .state('video.comments.settings', {
        url: '/settings',
        onEnter: ['$stateParams', '$state', '$modal', '$resource', 'Videos',
          '$http', 'User',
          function ($stateParams, $state, $modal,
            $resource, Videos, $http, User) {
            var modalInstance = $modal.open({
              size: 'lg',
              templateUrl: 'views/video/settings.html',
              resolve: {
                video: function () {
                  return Videos.getVideo($stateParams.videoId)
                },
                permissions: function () {
                  return Videos.getPermissions($stateParams.videoId)
                }
              },
              controller: 'VideoSettings'
            })
            modalInstance.result['finally'](function () {
              modalInstance = null
              if ($state.$current.name === stateName) {
                $state.go('ˆ')
              }
            })
          }
        ],
        onExit: function () {
          // console.log('onExit!')
          if (typeof modalInstance !== 'undefined') {
            modalInstance.close()
          }
        }
      })
      .state('video.comments.settings.tab', {
        url: '/:tab'
      })
      .state('video.comment', {
        // params: [],
        url: '/comments/:commentId',
        templateUrl: 'views/comments.html',
        controller: 'CommentsCtrl'
      })
      .state('register', {
        url: '/register',
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .state('registerOrg', {
        url: '/register/org',
        templateUrl: 'views/org-registration.html',
        controller: 'OrganizationRegistrationCtrl'
      })
      .state('registerGroup', {
        url: '/register/group',
        templateUrl: 'views/group-registration.html',
        controller: 'GroupRegistrationCtrl'
      })
      .state('org', {
        url: '/org/:orgId/register/group',
        templateUrl: 'views/group-registration.html',
        controller: 'GroupRegistrationCtrl'
      })
      .state('manage', {
        url: '/manage',
        templateUrl: 'views/manage.html',
        controller: 'ManageCtrl'
      })
  })
  .run(function (editableOptions) {
    editableOptions.theme = 'bs3' // bootstrap3 theme. Can be also 'bs2', 'default'
  })
