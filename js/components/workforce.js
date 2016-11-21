angular.module('team-task')
    .controller('WorkforceController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$filter', 'Pessoa',
        function ($scope, $rootScope, $state, Atividade, Time, DTOptionsBuilder, $resource, $filter, Pessoa) {
            $scope.showLoading = false;
            $scope.dtAOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);
            $scope.dtAOptions.withOption('responsive', true);
            $scope.showLoading = false;
            $scope.cargaTrabalho = [];
            function loadTable() {
                $scope.showLoading = true;
                $scope.cargaTrabalho = [];
                $scope.showLoading = false;
            }

            $scope.initWorkspaceWorkforce = function () {
                loadTable();
            };
        }]);