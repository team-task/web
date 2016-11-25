angular.module('team-task').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'views/login.html',
            reloadOnSearch: false,
            controller: 'LoginController',
            data: {
                requiredlogin: false
            }
        })
        .state('workspace-projects', {
            url: '/workspace/projects',
            templateUrl: 'views/workspace-projects.html',
            reloadOnSearch: false,
            controller: 'WorkspaceProjectsController',
            data: {
                requiredlogin: true
            }

        })
        .state('workspace-activities', {
            url: '/workspace/activities',
            templateUrl: 'views/workspace-activities.html',
            reloadOnSearch: false,
            controller: 'WorkspaceActivitiesController',
            data: {
                requiredlogin: true
            }
        })
        .state('project', {
            url: '/project/:id',
            templateUrl: 'views/project.html',
            reloadOnSearch: false,
            controller: 'ProjectController',
            data: {
                requiredlogin: true
            }
        })
        .state('config-teams', {
            url: '/teams',
            templateUrl: 'views/config-teams.html',
            reloadOnSearch: false,
            controller: 'ConfigTeamsController',
            data: {
                requiredlogin: true
            }
        })
        .state('team-activities', {
            url: '/activities/team/:id',
            templateUrl: 'views/team-activities.html',
            reloadOnSearch: false,
            controller: 'TeamActivitiesController',
            data: {
                requiredlogin: true
            }
        })
        .state('workspace-workforce', {
            url: '/workspace/workforce',
            templateUrl: 'views/workspace-workforce.html',
            reloadOnSearch: false,
            controller: 'WorkspaceWorkforceController',
            data: {
                requiredlogin: true
            }
        })
        .state('workforce', {
            url: '/workforce/:id',
            templateUrl: 'views/workforce.html',
            reloadOnSearch: false,
            controller: 'WorkforceController',
            data: {
                requiredlogin: true
            }
        });
});