angular.module('team-task')
.directive('header', function () {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: 'views/directives/header.html',
        controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
            
        }]
    };
});