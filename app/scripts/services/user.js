'use strict';
angular.module('youScriberApp').service('User', function ($rootScope, $http, $cookies) {
  var userService = this;

  this.register = function (user, email, pwHash, successCallback, errorCallback) {
    $http.post('/api/user', {user: user, email:email, pwHash:pwHash})
      .success(function(data) {
        console.log(data);
        userService.user = {name:user, id:data.id, orgs:[]};
        userService.currentContext = userService.user;
        $cookies['youScriber-user'] = JSON.stringify(userService.user);
        $rootScope.$emit('user-logged-in');
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
        userService.user = {name:user, id:data.id, orgs:data.orgs, groups:data.groups, managementPerms:data.managementPerms};
        userService.currentContext = userService.user;
        $cookies['youScriber-user'] = JSON.stringify(userService.user);
        $rootScope.$emit('user-logged-in');
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
        delete $cookies['youScriber-user'];
        delete $cookies['youScriber-context'];
        userService.user = null;

        if (successCallback) {
          successCallback(data);
        }
      })
      .error(function(error) {
        if (errorCallback) {
          errorCallback(error);
        }
      });
  };

  this.registerOrg = function (title, description, successCallback, errorCallback) {
    console.log('this.registerOrg::this.user:', this.user);
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

  this.registerGroup = function (name, description, successCallback, errorCallback) {
    console.log('this.registerGroup::this.user:', this.user);
    $http.post('/api/groups', {name: name, description:description, user:this.user})
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
    var loggedIn = this.hasOwnProperty('user') && this.user!=null;

    if (!loggedIn && $cookies.hasOwnProperty('youScriber-user')) {
      this.user = JSON.parse($cookies['youScriber-user']);
      // console.log(this.user);
      loggedIn = true;
    }
    // console.log('loggedin:', loggedIn);
    return loggedIn;
  };

  // this.getCurrentContext = function () {
  //   if (!this.currentContext)
  //   {
  //     if ($cookies.hasOwnProperty('youScriber-context')) {
  //       this.currentContext = JSON.parse($cookies['youScriber-context']);
  //     } else {
  //       this.currentContext = this.user;
  //     }
  //   }
  //   return this.currentContext;
  // };

  // this.setCurrentContext = function(org) {
  //   console.log('changing context: ', org);
  //   this.currentContext = org;
  //   $cookies['youScriber-context'] = JSON.stringify(org);
  // };

  this.joinGroup = function (gid) {
    return $http.post('/api/groups/' + gid + '/add', {user:this.user.id});
  };

});