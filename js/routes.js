angular.module('team-task').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'views/login.html',
            reloadOnSearch: false,
            controller: 'LoginController'
        })
        .state('workspace-projects', {
            url: '/workspace/projects',
            templateUrl: 'views/workspace-projects.html',
            reloadOnSearch: false,
            controller: 'WorkspaceProjectsController'

        })
        .state('workspace-activities', {
            url: '/workspace/activities',
            templateUrl: 'views/workspace-activities.html',
            reloadOnSearch: false,
            controller: 'WorkspaceActivitiesController'
        })
        .state('project', {
            url: '/project/:id',
            templateUrl: 'views/project.html',
            reloadOnSearch: false,
            controller: 'ProjectController'
        });
});