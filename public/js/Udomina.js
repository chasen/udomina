var Udomina = angular.module('Udomina',['ui.router']);

Udomina.config(function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise("login");
    $stateProvider
        .state('index',{
            url: '/menu',
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
Udomina.run(["$rootScope", "$state", function($rootScope, $state, AuthService){
    console.log(AuthService);
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if(toState.name !== 'login' && toState.name !== 'register'){
            if(!AuthService || !AuthService.isAuthenticated()){
                event.preventDefault();
                $state.go('login');
            }
        }
    })
}])

Udomina.factory('AuthService',["$http","$window",function($http,$window){
    var currentUser ={};

    function login(credentials){
        $http.post('/login',credentials)
            .success(function(data,status,headers,config){
                currentUser = {
                    uuid: data,
                    email: credentials.email
                };
                $window.sessionStorage["currentUser"] = JSON.stringify(currentUser);
                return currentUser;
            })
            .error(function(data, status, headers, config){
                return { error:true, message: data}
            });
    }

    function getCurrentUser(){
        return currentUser;
    };
    function isAuthenticated(){
        return !!currentUser.uuid;
    }
    function logout(){
        $window.sessionStorage["currentUser"] = null;
        currentUser = {};
    }
    function init(){
        if ($window.sessionStorage["currentUser"]) {
            currentUser = JSON.parse($window.sessionStorage["currentUser"]);
        }
    }
    init();
    return {
        login: login,
        logout: logout,
        getCurrentUser: getCurrentUser,
        isAuthenticated: isAuthenticated
    }
}]);

Udomina.controller('ApplicationController',function ($scope, $http, $state, AuthService){
    $scope.currentUser = AuthService.getCurrentUser();
    $scope.alert = '';

    $scope.loginFormData = {};
    $scope.loginForm = function(){
        $scope.currentUser = AuthService.login($scope.loginFormData);
        $state.go('index');
    }

    $scope.createGameData = {};
    $scope.createGameForm = function(){
        $http.post('/create-game',$scope.createGameData)
            .success(function(data,status,headers,config){
                $scope.user.uuid = data;
                $scope.user.email = $scope.loginFormData.email;
                $scope.alert ='';
                $state.go('index');
            })
            .error(function(data, status, headers, config){
                $scope.alert = data.message;
            });
    }
});


Udomina.controller('registrationController',function($scope, $http, $state){
    $scope.registerformData = {};
    $scope.registerForm = function(){
        $http.post('/register',$scope.registerformData)
            .success(function(data, status, headers, config){
                $scope.currentUser = {
                    uuid: data,
                    email: $scope.registerformData.email
                };
                $scope.alert ='';
                $state.go('index');
            })
            .error(function(data,status,headers,config){
                $scope.alert = data.message;
            });
    };
});
