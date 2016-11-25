angular.module('team-task')
    .controller('TeamActivitiesController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$filter', 'Pessoa', '$uibModal', '$stateParams',
        function ($scope, $rootScope, $state, Atividade, Time, DTOptionsBuilder, $resource, $filter, Pessoa,
                  $uibModal, $stateParams) {
            $scope.showLoading = false;
            $scope.dtAOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);
            $scope.dtAOptions.withOption('responsive', true);

            function loadTable() {
                $scope.listaAtividades = [];
                $scope.showLoading = true;
                Time.getById($stateParams.id).then(function (time) {
                    if (time) {

                        time.pessoaLider = {};
                        time.pessoaRecurso = [];
                        Pessoa.getById(time.lider).then(function (lider) {

                            var nomes = lider.nome.split(" ");
                            var iniciais = nomes[0].substring(0, 1);
                            var nomeSimples = nomes[0];
                            if (nomes.length > 1) {
                                iniciais += nomes[1].substring(0, 1);
                            }
                            lider.iniciais = iniciais.toUpperCase();
                            lider.nomeSimples = nomeSimples;
                            time.pessoaLider = lider;
                        });
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

                        var aQuery = {
                            "time": time._id.$oid,
                            "status": {
                                "$in": ["aguardando", "iniciada"]
                            }
                        };
                        Atividade.query(aQuery).then(function (atividades) {
                            angular.forEach(atividades, function (atividade, idAtividade) {
                                if(atividade.designado) {
                                    Pessoa.getById(atividade.designado).then(function (recurso) {
                                        var nomes = recurso.nome.split(" ");
                                        var iniciais = nomes[0].substring(0, 1);
                                        var nomeSimples = nomes[0];
                                        if (nomes.length > 1) {
                                            iniciais += nomes[1].substring(0, 1);
                                        }
                                        recurso.iniciais = iniciais.toUpperCase();
                                        recurso.nomeSimples = nomeSimples;
                                        atividade.pessoaRecurso = recurso;
                                    });
                                }
                            });
                            $scope.time = time;
                            $scope.time.atividades = atividades;
                            $scope.showLoading = false;
                        });
                    }
                });
            }

            $scope.initTeamActivities = function () {
                loadTable();
            };

            $scope.editarAtividadeTime = function (atividade) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-team-activity.html',
                        controller: 'ModalEditTeamActivityController',
                        resolve: {
                            timeSelecionado: function () {
                                return $scope.time;
                            },
                            atividadeSelecionada: function () {
                                return atividade;
                            }
                        }
                    }).result.then(function () {
                        loadTable();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.novaAtividadeTime = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-team-activity.html',
                        controller: 'ModalNewTeamActivityController',
                        resolve: {
                            timeSelecionado: function () {
                                return $scope.time;
                            }
                        }
                    }).result.then(function () {
                        loadTable();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.mostrarDetalheAtividadeTime = function (atividade) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-team-activity.html',
                        controller: 'ModalViewTeamActivityController',
                        resolve: {
                            atividadeSelecionada: function () {
                                return atividade;
                            }
                        }
                    }).result.then(function () {
                    }, function () {
                    });
            };

        }]);