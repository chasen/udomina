var Udomina = angular.module('Udomina',['ui.router']);

Udomina.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('index',{
            url: '',
            templateUrl: 'partials/index.html'
        })
        .state('login',{
            url: '/login',
            templateUrl: 'partials/login.html'
        })
        .state('register',{
            url: '/register',
            templateUrl: 'partials/register.html'
        })
        .state('createGame',{
            url: '/create-game',
            templateUrl: 'partials/create-game.html'
        })
        .state('joinGame',{
            url: '/join-game',
            templateUrl: 'partials/join-game.html',
            resolve: {
                games: function($http){
                    return $http({method:'GET',url: '/games'})
                }
            }
        })
        .state('game',{
            url: '/game/:gameId',
            templateUrl: 'partials/game.html'
        })
        .state('stats',{
            url: '/stats',
            templateUrl: 'partials/stats.html'
        })
});
Udomina.controller('ApplicationController',function ($scope){

});


//
//Udomina.constant('AUTH_EVENTS', {
//    loginSuccess: 'auth-login-success',
//    loginFailed: 'auth-login-failed',
//    logoutSuccess: 'auth-logout-success',
//    sessionTimeout: 'auth-session-timeout',
//    notAuthenticated: 'auth-not-authenticated',
//    notAuthorized: 'auth-not-authorized'
//});
//
//Udomina.constant('USER_ROLES',{
//    all: '*',
//    admin: 'admin',
//    member: 'member',
//    guest: 'guest'
//});
//
//
//Udomina.controller('LoginController', function ($scope, $rootScope, AUTH_EVENTS, AuthService) {
//    $scope.credentials = {
//        username: '',
//        password: ''
//    };
//    $scope.login = function (credentials) {
//        AuthService.login(credentials).then(function (user) {
//            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
//            $scope.setCurrentUser(user);
//        }, function () {
//            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
//        });
//    };
//});
//
//Udomina.service('Session', function () {
//    this.create = function (sessionId, userId, userRole) {
//        this.id = sessionId;
//        this.userId = userId;
//        this.userRole = userRole;
//    };
//    this.destroy = function () {
//        this.id = null;
//        this.userId = null;
//        this.userRole = null;
//    };
//    return this;
//});
//
//Udomina.controller('ApplicationController', function ($scope, USER_ROLES, AuthService) {
//    $scope.currentUser = null;
//    $scope.userRoles = USER_ROLES;
//    $scope.isAuthorized = AuthService.isAuthorized;
//
//    $scope.setCurrentUser = function (user) {
//        $scope.currentUser = user;
//    };
//});
//
//Udomina.controller('gameCtrl',['$scope','$routeParams','$http'],function($scope, $routeParams, $http){
//
//});
//
//Udomina.factory('AuthService', function ($http, Session) {
//    var authService = {};
//
//    authService.login = function (credentials) {
//        return $http
//            .post('/login', credentials)
//            .then(function (res) {
//                Session.create(res.data.id, res.data.user.id,
//                    res.data.user.role);
//                return res.data.user;
//            });
//    };
//
//    authService.isAuthenticated = function () {
//        return !!Session.userId;
//    };
//
//    authService.isAuthorized = function (authorizedRoles) {
//        if (!angular.isArray(authorizedRoles)) {
//            authorizedRoles = [authorizedRoles];
//        }
//        return (authService.isAuthenticated() &&
//        authorizedRoles.indexOf(Session.userRole) !== -1);
//    };
//
//    return authService;
//});