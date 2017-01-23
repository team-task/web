angular.module('team-task')
    .controller('TeamActivitiesController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$filter', 'Pessoa', '$uibModal', '$stateParams',
        function ($scope, $rootScope, $state, Atividade, Time, DTOptionsBuilder, $resource, $filter, Pessoa,
                  $uibModal, $stateParams) {
            $rootScope.showLoading = false;
            $scope.dtAOptions = DTOptionsBuilder.newOptions();
            $scope.dtAOptions.withOption('displayLength', 25);

            function loadTable() {
                $scope.listaAtividades = [];
                $rootScope.showLoading = true;
                Time.getById($stateParams.id).then(function (time) {
                    if (time) {
                        var idusuario;
                        if($rootScope.usuarioLogado.perfil === 'gerente') {
                            idusuario = $rootScope.usuarioLogado.subordinado;
                        } else {
                            idusuario = $rootScope.usuarioLogado._id.$oid;
                        }
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
                            "time": time._id.$oid
                        };
                        if(time.lider !== idusuario) {
                            aQuery.designado = idusuario;
                        }
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
                            $scope.atividadesRoot = atividades;

                            $scope.filterChange();

                            $rootScope.showLoading = false;
                        });
                    }
                });
            }

            $scope.filtro = [];
            $scope.filterChange = function () {
                if($scope.filtro) {
                    var listaFiltro = [];
                    if ($scope.filtro[0]) {
                        listaFiltro.push("aguardando");
                    }
                    if ($scope.filtro[1]) {
                        listaFiltro.push("iniciada");
                    }
                    if ($scope.filtro[2]) {
                        listaFiltro.push("concluída");
                    }
                    if ($scope.filtro[3]) {
                        listaFiltro.push("cancelada");
                    }
                    if(listaFiltro.length > 0) {
                        $scope.listaFiltro = listaFiltro;
                        $scope.time.atividades = $filter('filter')($scope.atividadesRoot, filterFunction);
                    } else {
                        $scope.time.atividades = [];
                    }
                }
            };

            function filterFunction (item) {
                if(item) {
                    if($scope.listaFiltro) {
                        return $scope.listaFiltro.indexOf(item.status.toLowerCase()) > -1;
                    } else {
                        return false;
                    }
                }
            }

            $scope.initTeamActivities = function () {
                $scope.filtro = [true, true, false, false];
                $scope.listaFiltro= ["aguardando", "iniciada", "concluída", "cancelada"];
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