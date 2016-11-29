angular.module('team-task')
    .controller('ConfigTeamsController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$uibModal', '$stateParams', 'Pessoa',
        function ($scope, $rootScope, $state, Projeto, Atividade, Time, DTOptionsBuilder, $resource, $uibModal,
                  $stateParams, Pessoa) {
            $scope.showLoading = false;
            $scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);

            function loadTable () {
                $scope.showLoading = true;
                if($rootScope.usuarioLogado) {
                    var idusuario = $rootScope.usuarioLogado._id.$oid;
                    var qTime = {
                        "$or": [
                            {"lider": idusuario},
                            {"recursos": idusuario}
                        ]
                    };
                    Time.query(qTime).then(function (times) {
                        angular.forEach(times, function (time, idTime) {
                            time.pessoaRecurso = [];
                            for (var a = 0; a < time.recursos.length; a++) {
                                Pessoa.getById(time.recursos[a]).then(function (recurso) {

                                    var nomes = recurso.nome.split(" ");
                                    var iniciais = nomes[0].substring(0, 1);
                                    var nomeSimples = nomes[0];
                                    if (nomes.length > 1) {
                                        iniciais += nomes[1].substring(0, 1);
                                    }
                                    recurso.iniciais = iniciais.toUpperCase();
                                    recurso.nomeSimples = nomeSimples;
                                    time.pessoaRecurso.push(recurso);
                                });
                            }
                        });
                        $scope.times = times;
                        $scope.showLoading = false;
                    });
                }
            }


            $scope.initConfigTeams = function () {
                loadTable();
            };

            $scope.mostrarDetalheTime = function (time) {
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

            $scope.novoTime = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-team.html',
                        controller: 'ModalNewTeamController'
                    }).result.then(function () {
                        loadTable();
                    }, function () {
                    });
            };

            $scope.editarTime = function (time) {
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

            $scope.mostrarDetalheTime = function (time) {
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
