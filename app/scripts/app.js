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
  'ui.router'
])
  .config(function($stateProvider, $urlRouterProvider) {
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
            onEnter: ['$stateParams', '$state', '$modal', '$resource', 'Videos', function($stateParams, $state, $modal, $resource, Videos, $http) {
              $modal.open({
                  size: 'lg',
                  templateUrl: "views/video/settings.html",
                  resolve: {
                    video: function() { Videos.getVideo($stateParams.videoId); }
                  },
                  controller: ['$scope', 'video', '$http', function($scope, video, $http) {
                    $scope.dismiss = function() {
                      $scope.$dismiss();
                    };

                    $scope.getUsernames = function (query) {
                      console.log('getUsernames::query:', query);
                      return $http.get('/api/users/'+query)
                        .then(function(response){
                          console.log(response);
                          // return [];
                          var results = response.data.map(function(thisUser){
                            console.log(thisUser);
                            console.log(thisUser.name);
                            var uname = thisUser.name;
                            return uname; //TODO: eventually return icon/avatar here?
                          });
                          console.log(results);
                          return results;
                        });
                    };

                    $scope.save = function() {
                      console.log('save the settings for the video');
                      // item.update().then(function() {
                      //   $scope.$close(true);
                      // });
                    };

                    $scope.keys = Object.keys;

                    $scope.videoService = Videos;
                  }]
              }).result.finally(function() {
                  $state.go('^');
              });
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
  })
  .run(function(editableOptions) {
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  });
