'use strict';

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
  'textAngular'
])
  .config(function($stateProvider, $urlRouterProvider, $provide) {
    $urlRouterProvider.otherwise('/dash');
    $stateProvider
      .state('dash', {
        url:'/dash', 
        templateUrl: 'views/dash.html',
        controller: 'DashCtrl'
      })
      .state('video', {
        url:'/video/:videoId', 
        templateUrl: 'views/video.html',
        controller: 'VideoCtrl'
      })
        .state('video.comments', {
          // params: [],
          url:'/comments',
          templateUrl: 'views/comments.html',
          controller: 'CommentsCtrl'
        })
          .state('video.comments.settings', {
            url: '/settings',
            onEnter: ['$stateParams', '$state', '$modal', '$resource', 'Videos', '$http', 'User', function($stateParams, $state, $modal, $resource, Videos, $http, User) {
              var theModal = $modal.open({
                  size: 'lg',
                  templateUrl: "views/video/settings.html",
                  resolve: {
                    video: function() { return Videos.getVideo($stateParams.videoId); }
                  },
                  controller: 'VideoSettings'
              }).result.finally(function() {
                  $state.go('^');
              });
              // theModal.opened.then(function () {
                
              // });
            }]
          })
        .state('video.comment', {
          // params: [],
          url:'/comments/:commentId',
          templateUrl: 'views/comments.html',
          controller: 'CommentsCtrl'
        })
      .state('register', {
        url:'/register', 
        templateUrl: 'views/registration.html',
        controller: 'RegistrationCtrl'
      })
      .state('login', {
        url:'/login', 
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .state('registerOrg', {
        url:'/register/org', 
        templateUrl: 'views/org-registration.html',
        controller: 'OrganizationRegistrationCtrl'
      })
      .state('registerGroup', {
        url:'/register/group', 
        templateUrl: 'views/group-registration.html',
        controller: 'GroupRegistrationCtrl'
      })
      .state('org', {
        url:'/org/:orgId/register/group', 
        templateUrl: 'views/group-registration.html',
        controller: 'GroupRegistrationCtrl'
      })
      .state('manage', {
        url:'/manage', 
        templateUrl: 'views/manage.html',
        controller: 'ManageCtrl'
      })

    $provide.decorator('taOptions', ['$delegate', function(taOptions) {
      taOptions.toolbar = [
        // ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
        ['insertLink', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'html'],
        // ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent'],
        //['html', 'insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
      ];
      return taOptions;
    }])

    
  })
  .run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  });
