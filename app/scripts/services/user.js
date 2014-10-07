'use strict';
angular.module('youScriberApp').service('User', function ($rootScope, $http, $cookies) {
  var userService = this;

  this.register = function (user, email, pwHash, successCallback, errorCallback) {
    $http.post('/api/user', {user: user, email:email, pwHash:pwHash})
      .success(function(data) {
        console.log(data);
        userService.user = {name:user, id:data.id, orgs:[]};
        successCallback(data);
      })
      .error(function(error) {
        errorCallback(error);
      });
  };

  this.login = function (user, pwHash, successCallback, errorCallback) {
    $http.post('/api/user/login', {user: user, pwHash:pwHash})
      .success(function(data) {
        console.log('logged in!', data);
        userService.user = {name:user, id:data.id, orgs:data.orgs, groups:data.groups};
        successCallback(data);
      })
      .error(function(error) {
        errorCallback(error);
      });
  };

  this.logout = function (successCallback, errorCallback) {
    console.log('implement logout?');
    $http.post('/api/user/logout', {uid: this.user.id})
      .success(function(data) {
        console.log('logged out!', data);
        userService.user = {};
        successCallback(data);
      })
      .error(function(error) {
        errorCallback(error);
      });
  };

  this.registerOrg = function (title, description, successCallback, errorCallback) {
    $http.post('/api/org', {title: title, description:description, user:this.user})
      .success(function(data) {
        console.log(data);
        // userService.user.orgs.push = {name:user};
        successCallback(data);
      })
      .error(function(error) {
        errorCallback(error);
      });
  };

  this.loggedIn = function () {
    return this.hasOwnProperty('user') && this.user!=null;
  }

});