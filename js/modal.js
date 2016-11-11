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
    function ($scope, $rootScope, Projeto, $state, projetoEdicao, $uibModal) {

        $scope.projeto = {};

        $scope.initModalNewProject = function () {
            $scope.projeto = projetoEdicao;
        };

        $scope.deleteProject = function () {
            if($scope.projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/delete-project.html',
                        controller: function ($scope, projetoExclusao) {
                            $scope.projeto = projetoExclusao;
                            $scope.ok = function () {
                                $scope.$close(true);
                            };
                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };
                        },
                        resolve: {
                            projetoExclusao: function () {
                                return $scope.projeto;
                            }
                        }
                    }).result.then(function () {
                        console.log('hit ok');
                        deleteProject();
                    }, function () {
                        console.log('hit cancel');
                    });
            }
        };

        function deleteProject () {
            $scope.projeto.$remove().then(function () {
                $scope.$close(true);
            });
        }

        $scope.ok = function () {
            $scope.projeto.$saveOrUpdate().then(function () {
                $scope.$close(true);
            });
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalNewActivityController',
    function ($scope, $rootScope, projetoSelecionado, $state, Time, Pessoa) {

        $scope.projeto = projetoSelecionado;
        $scope.atividadeNova = {};
        $scope.time = {};
        $scope.listaRecursos = [];
        $scope.showSelectLoading = false;

        $scope.initModalNewActivity = function () {
            $scope.atividadeNova = {
                "nome": "",
                "status": "Aguardando",
                "inicio": new Date(),
                "duracao": 0,
                "fim": null,
                "designado" : ""
            };
            $scope.listaTimes = [];

            var idusuario = $rootScope.usuarioLogado._id.$oid;
            var qTime = {"lider": idusuario};
            Time.query(qTime).then(function (times) {

                if (times[0]) {
                    $scope.listaTimes = times;
                }
            });

        };

        $scope.calculaFim = function () {
            if($scope.atividadeNova.duracao !== 0 && $scope.atividadeNova.inicio) {
                $scope.atividadeNova.fim = moment($scope.atividadeNova.inicio).businessAdd(($scope.atividadeNova.duracao - 1)).toDate();
            } else {
                $scope.atividadeNova.fim = null;
            }
        };

        $scope.carregaPessoas = function () {
            $scope.listaRecursos = [];
            $scope.showSelectLoading = true;
            if($scope.time) {
                Time.getById($scope.time._id.$oid).then(function (time) {
                    if(time) {
                        var arrayOids = [];
                        for(var i = 0; i < time.recursos.length; i++) {
                            arrayOids.push({"$oid" : time.recursos[i]});
                        }
                        var pQuery = {
                            "_id": {
                                "$in" : arrayOids
                            }
                        };
                        Pessoa.query(pQuery).then(function (pessoas) {
                            if(pessoas[0]) {
                                $scope.listaRecursos = pessoas;
                                $scope.showSelectLoading = false;
                            }
                        })
                    }
                });
            }
        };

        $scope.ok = function () {
            $scope.$close(true);
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

