angular.module('team-task').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('login', {
            url: '/',
            templateUrl: 'views/login.html',
            reloadOnSearch: false,
            controller: 'LoginController',
            data: {
                requiredlogin: false,
                showMenu: false
            }
        })
        .state('workspace', {
            url: '/workspace',
            reloadOnSearch: false,
            templateUrl: 'views/workspace.html',
            controller: function ($rootScope) {
                $rootScope.showLoading = false;
            },
            data: {
                requiredlogin: true,
                collapsed: ["in", "", "", ""],
                showMenu: true
            }
        })
        .state('workspace.projects', {
            url: '/projects',
            templateUrl: 'views/projects.html',
            controller: 'WorkspaceProjectsController',
            reloadOnSearch: false,
            data: {
                requiredlogin: true,
                collapsed: ["in", "", "", ""],
                showMenu: true
            }
        })
        .state('workspace.activities', {
            url: '/activities',
            templateUrl: 'views/activities.html',
            reloadOnSearch: false,
            controller: 'WorkspaceActivitiesController',
            data: {
                requiredlogin: true,
                collapsed: ["", "in", "", ""]
            }
        })
        .state('workspace.project', {
            url: '/project/:id',
            templateUrl: 'views/project-2.html',
            controller: 'ProjectController',
            reloadOnSearch: false,
            data: {
                requiredlogin: true,
                collapsed: ["in", "", ""]
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
        .state('config-people', {
            url: '/people',
            templateUrl: 'views/config-people.html',
            reloadOnSearch: false,
            controller: 'ConfigPeopleController',
            data: {
                requiredlogin: true
            }
        })
        .state('workspace.team', {
            url: '/team/:id',
            templateUrl: 'views/team.html',
            reloadOnSearch: false,
            controller: 'TeamActivitiesController',
            data: {
                requiredlogin: true,
                collapsed: ["", "in", "", ""]
            }
        })
        .state('workspace.workforces', {
            url: '/workforces',
            templateUrl: 'views/workforces.html',
            reloadOnSearch: false,
            controller: 'WorkspaceWorkforceController',
            data: {
                requiredlogin: true,
                collapsed: ["", "", "in", ""]
            }
        })
        .state('workspace.workforce', {
            url: '/workforce/:id',
            templateUrl: 'views/workforce-2.html',
            reloadOnSearch: false,
            controller: 'WorkforceController',
            data: {
                requiredlogin: true,
                collapsed: ["", "", "in", ""]
            }
        })
        .state('workspace.resourcetimesheet', {
            url: '/timesheet/:id',
            templateUrl: 'views/timesheet.html',
            reloadOnSearch: false,
            controller: 'WorkspaceTimesheetController',
            data: {
                requiredlogin: true,
                collapsed: ["", "", "", "in"]
            }
        })
        .state('workspace.timesheet', {
            url: '/timesheet',
            templateUrl: 'views/timesheet.html',
            reloadOnSearch: false,
            controller: 'WorkspaceTimesheetController',
            data: {
                requiredlogin: true,
                collapsed: ["", "", "", "in"]
            }
        })
        .state('workspace.dashboards', {
            url: '/dashboards',
            templateUrl: 'views/dashboards.html',
            reloadOnSearch: false,
            controller: 'WorkspaceDashboardsController',
            data: {
                requiredlogin: true,
                collapsed: ["", "", "", ""]
            }
        });
});