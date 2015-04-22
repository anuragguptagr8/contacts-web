'use strict';
/**
 * Angularjs services
 */

var appServices = angular.module('conactsWebApp.services', []);

/**
 * Application configuration.
 * Application configuration is exposed to the controllers as well as dependent services in the form of a config service
 * Any controller or service needs to access global configuration must inject this service.
 * Use standard angular injection
 */
appServices.factory('config', [function() {
  return {
    publicRoutes: [
      '/register'
    ]
  };
}]);

/**
 * Angular service that abstracts the sessionToken storage and retrieval
 */
appServices.factory('storage', [function() {
  var service = {};
  /**
   * Returns the stored sessionToken
   * This method first checks in sessionStorage if sessionToken is not found in sessionStorage
   * this method checks in localStorage, if sessionToken still not found in localStorage, then it will return null or undefined
   * The controllers has to implement the logic that if sessionToken is null/undefined then user is not authorized
   */
  service.getSessionToken = function() {
    var token = sessionStorage.getItem('contacts-web.application.auth.token');
    if (!token) {
      token = localStorage.getItem('contacts-web.application.auth.token');
    }
    return token;
  };
  /**
   * Store the session token in sessionStorage
   * A boolean flag is passed which when true indicate that user chose remember me option and data should also be stored in localStorage
   */
  service.storeSessionToken = function(sessionToken, flag) {
    sessionStorage.setItem('contacts-web.application.auth.token', sessionToken);
    if (flag) {
      localStorage.setItem('contacts-web.application.auth.token', sessionToken);
    }
  };

  /**
   * Get current user profile stored in sessionStorage or localStorage
   */
  service.getCurrentUserProfile = function() {
    var profile = sessionStorage.getItem('contacts-web.application.auth.profile');
    if (!profile) {
      profile = localStorage.getItem('contacts-web.application.auth.profile');
    }
    return angular.fromJson(profile);
  };

  /**
   * Store the current user profile in sessionStorage
   * A boolean flag is passed which when true indicate that user chose remember me option and data should also be stored in localStorage
   */
  service.storeCurrentUserProfile = function(profile, flag) {
    profile = angular.toJson(profile);
    sessionStorage.setItem('contacts-web.application.auth.profile', profile);
    if (flag) {
      localStorage.setItem('contacts-web.application.auth.profile', profile);
    }
  };

  /**
   * Utility method to clear the sessionStorage
   */
  service.clear = function() {
    sessionStorage.removeItem('contacts-web.application.auth.token');
    sessionStorage.removeItem('contacts-web.application.auth.profile');

    localStorage.removeItem('contacts-web.application.auth.token');
    localStorage.removeItem('contacts-web.application.auth.profile');
  };
  return service;
}]);

/**
 * Application utility service
 */
appServices.factory('util', ['$log', 'SecurityService', 'UserService', 'storage', function($log, SecurityService, UserService, storage) {
  var service = {};

  /**
   * Function to check if any user is currently logged in
   */
  service.isLoggedIn = function() {
    var profile = storage.getCurrentUserProfile();
    var sessionToken = storage.getSessionToken();
    if (profile && sessionToken) {
      return true;
    }
    return false;
  };

  return service;
}]);

/**
 * Application SecurityService.
 * This service is responsible for all the application security.
 * All the methods in this service returns a promise.
 * When async opeartion finishes that promise would be resolved or rejected.
 * The promise would be resolved with actual response from Backend API and would be rejected be the reason
 */
appServices.factory('SecurityService', ['BASE_URL', 'config', 'storage', '$http', '$q', function(BASE_URL, config, storage, $http, $q) {
  var service = {};
  /**
   * Authenticate the user using password type.
   */
  service.authenticate = function(email, password) {
    var deferred = $q.defer();
    // prepare http request object
    var req = {
      method: 'POST',
      url: BASE_URL + '/login',
      data: {
        email: email,
        password: password
      }
    };
    $http(req).then(function(payload) {
      deferred.resolve(payload.data);
    }, function(reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  };
  return service;
}]);

/**
 * Application UserService.
 * This service exposes user actions like getUserProfile, getMyUserProfile etc
 * All the methods in this service returns a promise.
 * When async opeartion finishes that promise would be resolved or rejected.
 * The promise would be resolved with actual response from Backend API and would be rejected be the reason
 */
appServices.factory('UserService', ['BASE_URL', 'config', 'storage', '$http', '$q', function(BASE_URL, config, storage, $http, $q) {
  var service = {};

  /**
   * Register the user on mom and pop platform
   * registration is registration entity object which would be converted to json string
   * userProfile and businessProfile are optional
   */
  service.register = function(registration) {
    var deferred = $q.defer();
    // prepare request object
    var req = {
      method: 'POST',
      url: BASE_URL + '/register',
      data: registration
    };
    $http(req).then(function(payload) {
      deferred.resolve(payload.data);
    }, function(reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  };
  /**
   * Get my user profile
   */
  service.getMyUserProfile = function() {
    var deferred = $q.defer();
    var accessToken = storage.getSessionToken();
    // prepare http request object
    var req = {
      method: 'GET',
      url: BASE_URL + '/users/me',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };
    $http(req).then(function(payload) {
      deferred.resolve(payload.data);
    }, function(reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  service.getAllContacts = function() {
    var deferred = $q.defer();
    var accessToken = storage.getSessionToken();
    // prepare http request object
    var req = {
      method: 'GET',
      url: BASE_URL + '/users/me/contacts',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };
    $http(req).then(function(payload) {
      deferred.resolve(payload.data);
    }, function(reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  service.addContact = function(contact) {
    var deferred = $q.defer();
    var accessToken = storage.getSessionToken();
    // prepare http request object
    var req = {
      method: 'POST',
      url: BASE_URL + '/users/me/contacts',
      data: contact,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };
    $http(req).then(function(payload) {
      deferred.resolve(payload.data);
    }, function(reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  service.updateContact = function(contactId, entity) {
    var deferred = $q.defer();
    var accessToken = storage.getSessionToken();
    // prepare http request object
    var req = {
      method: 'PUT',
      url: BASE_URL + '/users/me/contacts/' + contactId,
      data: entity,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };
    $http(req).then(function(payload) {
      deferred.resolve(payload.data);
    }, function(reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  };

  service.deleteContact = function(contactId) {
    var deferred = $q.defer();
    var accessToken = storage.getSessionToken();
    // prepare http request object
    var req = {
      method: 'DELETE',
      url: BASE_URL + '/users/me/contacts/' + contactId,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    };
    $http(req).then(function(payload) {
      deferred.resolve(payload.data);
    }, function(reason) {
      deferred.reject(reason);
    });
    return deferred.promise;
  };
  return service;
}]);