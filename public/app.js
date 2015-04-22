'use strict';

/**
 * This is the main file. This will bootstrapped the HQ angular app and will do the required configurations
 */
var app = angular.module('conactsWebApp', ['ui.router', 'conactsWebApp.controllers', 'conactsWebApp.services']);
app.constant('BASE_URL', 'http://localhost:8080/api/v1');
/**
 * App configurations goes here
 */
app.config(['$stateProvider', '$urlRouterProvider','$locationProvider', '$compileProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('login', {
      url: '/',
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
    })
    .state('user', {
      url: '/user',
      resolve: {
        profile: function(UserService, storage) {
          var profile = storage.getCurrentUserProfile();
          return profile;
        },
        resolution: function(UserService, profile) {
          return UserService.getAllContacts().then(function(contactsData) {
            return {
              contactsData: contactsData,
              profile: profile
            }
          });
        }
      },
      templateUrl: 'partials/user.html',
      controller: 'UserController'
    })
    .state('addContact', {
      url: 'addContact',
      templateUrl: 'partials/addContact.html',
      controller: 'AddContactController'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'partials/register.html',
      controller: 'RegisterController'
    });
}]);

app.run(['$rootScope', '$log', '$state', '$interval', '$location', 'SecurityService', 'storage', 'config', 'util', function($rootScope, $log, $state, $interval, $location, SecurityService, storage, config, util) {
  // authentication logic
  var token = storage.getSessionToken();
  var profile = storage.getCurrentUserProfile();
  if(token && profile) {
    // check if the user is already logged in
    $location.path('/user');
  } else {
    // redirect to login
    $location.path('/');
  }

  $rootScope.$on('$routeChangeStart', function () {
    var path = $location.path();
    // check if the user is authorized
    if(util.isLoggedIn()) {
      $location.path('/user');
    } else if(config.publicRoutes.indexOf(path) === -1) {
      $location.path('/');
    }
  });

  $rootScope.logout = function() {
    storage.clear();
    $location.path('/');
  };
}]);