angular.module('team-task').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        })
        .state('workspace-projects', {
            url: '/workspace/projects',
            templateUrl: 'views/workspace-projects.html',
            controller: 'WorkspaceProjectsController'
        })
        .state('project', {
            url: '/project/:id',
            templateUrl: 'views/workspace-projects.html',
            controller: 'WorkspaceProjectsController'
        });
});