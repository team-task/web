angular.module('team-task').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })
        .state('workspace', {
            url: '/workspace',
            templateUrl: 'views/workspace.html',
            controller: 'WorkspaceController'
        });
});