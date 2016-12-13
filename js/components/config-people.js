angular.module('team-task')
    .controller('ConfigPeopleController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$uibModal', '$stateParams', 'Pessoa',
        function ($scope, $rootScope, $state, Projeto, Atividade, Time, DTOptionsBuilder, $resource, $uibModal,
                  $stateParams, Pessoa) {
            $scope.showLoading = false;

            function loadTable () {
                $scope.showLoading = true;
                if($rootScope.usuarioLogado) {
                    var idusuario = $rootScope.usuarioLogado._id.$oid;
                    var qPessoa = {
                        "cadastrado": idusuario
                    };
                    Pessoa.query(qPessoa, {"fields": {"senha": 0}}).then(function (pessoas) {
                        for(var i = 0; i < pessoas.length; i++) {
                            var nomes = pessoas[i].nome.split(" ");
                            var iniciais = nomes[0].substring(0, 1);
                            var nomeSimples = nomes[0];
                            if (nomes.length > 1) {
                                iniciais += nomes[1].substring(0, 1);
                            }
                            pessoas[i].iniciais = iniciais.toUpperCase();
                            pessoas[i].nomeSimples = nomeSimples;
                        }
                        $scope.listagemPessoas = pessoas;
                        $scope.showLoading = false;
                    });
                }
            }


            $scope.initConfigPeople = function () {
                loadTable();
            };

            $scope.mostrarDetalhePessoa = function (time) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-team.html',
                        controller: 'ModalViewTeamController',
                        resolve: {
                            timeEdicao: function () {
                                return projeto;
                            }
                        }
                    }).result.then(function () {
                        loadTable();
                    }, function () {
                    });
            };

            $scope.novaPessoa = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-team.html',
                        controller: 'ModalNewTeamController'
                    }).result.then(function () {
                        loadTable();
                    }, function () {
                    });
            };

            $scope.editarPessoa = function (time) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-team.html',
                        controller: 'ModalEditTeamController',
                        resolve: {
                            timeEdicao: function () {
                                return time;
                            }
                        }
                    }).result.then(function () {
                        loadTable();
                    }, function () {
                    });
            };

            $scope.mostrarDetalhePessoa = function (time) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-team.html',
                        controller: 'ModalViewTeamController',
                        resolve: {
                            timeSelecionado: function () {
                                return time;
                            }
                        }
                    }).result.then(function () {}, function () {});
            };

        }]);
