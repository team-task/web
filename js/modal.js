angular.module('team-task')
    .controller('ModalNewProjectController',
    function ($scope, $rootScope, Projeto, $state) {
        $scope.novoProjeto = new Projeto();
        $scope.novoProjeto.nome = "";
        $scope.novoProjeto.status = "Ativo";
        $scope.novoProjeto.alerta = "verde";
        $scope.novoProjeto.inicio = null;
        $scope.novoProjeto.fim = null;

        $scope.initModalNewProject = function () {

        };

        $scope.ok = function () {

            $scope.novoProjeto.administrador = $rootScope.usuarioLogado._id.$oid;
            $scope.novoProjeto.$save().then(function () {
                $state.go('workspace-projects');
                $scope.$close(true);
            });
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalEditProjectController',
    function ($scope, $rootScope, Projeto, $state, projetoEdicao) {

        $scope.projeto = {};

        $scope.initModalNewProject = function () {
            $scope.projeto = projetoEdicao;
        };

        $scope.deleteProject = function () {

        };

        $scope.ok = function () {

            $scope.$close(true);
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

