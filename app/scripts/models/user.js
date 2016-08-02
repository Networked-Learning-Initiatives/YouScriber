/* global angular */
angular.module('app')
  .provider('User', function () {
    this.$get = ['$resource', function ($resource) {
      var User = $resource('http://localhost:3333/api/user/:_id', {}, {
        update: {
          method: 'PUT'
        }
      })

      return User
    }]
  })
