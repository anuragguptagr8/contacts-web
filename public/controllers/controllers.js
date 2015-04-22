'use strict';

var appControllers = angular.module('conactsWebApp.controllers', ['conactsWebApp.services']);

// login controller
appControllers.controller('LoginController', ['$scope', '$state', '$log', 'SecurityService', 'UserService', 'config', 'storage', function ($scope, $state, $log, SecurityService, UserService, config, storage) {
  $scope.status = {
    error: false,
    message: ''
  };
  $scope.rememberMe = false;
  var loginHandler = function(token) {
    storage.storeSessionToken(token, $scope.rememberMe);
    UserService.getMyUserProfile().then(function(profile) {
      storage.storeCurrentUserProfile(profile, $scope.rememberMe);
      $state.go('user');
    }, function(profileReason) {
      $log.error('Error fetching user profile HTTP STATUS CODE [ ' + profileReason.status + ' ] Error [ ' + angular.toJson(profileReason.data) + ' ]');
    });
  };

  $scope.login = function(credentials) {
    SecurityService.authenticate(credentials.email, credentials.password).then(function(data) {
      loginHandler(data.data[0].token);
    }, function(reason) {
      $log.error('Login Error HTTP STATUS CODE [ ' + reason.status + ' ], Error message [ ' + angular.toJson(reason.data) + ' ]');
      $scope.status.error = true;
      if(reason.status === 401 || reason.status === 403) {
        $scope.status.message = 'Invalid email/password or user is not authorized to perform this operation';
      } else {
        $scope.status.message = reason.data.error;
      }
    });
  };
}]);

// register controller
appControllers.controller('RegisterController', ['$scope', '$log', 'UserService', function ($scope, $log, UserService) {
  $scope.user = {};
  $scope.status = {
    error: false,
    success: false,
    message: ''
  };
  $scope.register = function() {
    UserService.register($scope.user).then(function() {
      $scope.status.error = false;
      $scope.status.success = true;
      $scope.status.message = 'User registerd successfully';
      $scope.user = {};
    }, function(reason) {
      $log.error('Error registering user. HTTP STATUS CODE [' + reason.status + '], Error message [' + angular.toJson(reason.data) + ']');
      $scope.status.error = true;
      $scope.status.success = false;
      $scope.status.message = reason.data;
    });
  };
}]);

// user controller
appControllers.controller('UserController', ['$scope', '$state', '$log', 'UserService', 'resolution', function ($scope, $state, $log, UserService, resolution) {
  $scope.user = resolution.profile.data[0];
  $scope.contacts = resolution.contactsData.data;
  $scope.removeContact = function(contact) {
    UserService.deleteContact(contact.id).then(function() {
      $state.reload();
    }, function(error) {
      $log.error('Error deleting contact. HTTP STATUS CODE [' + reason.status + '], Error message [' + angular.toJson(reason.data) + ']');
    });
  };

  $scope.addContact = function() {
    $state.go('addContact');
  }
}]);

appControllers.controller('AddContactController', ['$scope', '$state', '$log', 'UserService', function ($scope, $state, $log, UserService) {
  $scope.user = {};
  $scope.add = function() {
    UserService.addContact($scope.user).then(function() {
      $state.go('user');
    }, function(reason) {
      $log.error('Error adding contact. HTTP STATUS CODE [' + reason.status + '], Error message [' + angular.toJson(reason.data) + ']');
    });
  }
}]);