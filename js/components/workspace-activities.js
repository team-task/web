angular.module('team-task')
    .controller('WorkspaceActivitiesController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$filter', 'Pessoa', '$uibModal', '$q',
        function ($scope, $rootScope, $state, Atividade, Time, DTOptionsBuilder, $resource, $filter, Pessoa, $uibModal, $q) {
            $rootScope.showLoading = false;
            //$scope.dtAOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);
            $scope.dtAOptions = DTOptionsBuilder.newOptions();
            $scope.dtAOptions.withOption('displayLength', 25);
            $scope.dtAOptions.withOption('order', [[2,"asc"]]);

            $scope.novaAtividade = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-teams-activity.html',
                        controller: 'ModalNewTeamsActivityController'
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

            $scope.editarAtividadeTime = function (atividade) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-team-activity.html',
                        controller: 'ModalEditTeamActivityController',
                        resolve: {
                            timeSelecionado: function () {
                                return atividade.timeObj;
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

            $scope.exportarTabela = function () {
                if($scope.listaAtividadesRoot) {
                    waitingDialog.show('Gerando arquivo. Aguarde.');
                    var dados = [];
                    dados.push(['Atividade', 'Status', 'Inicio', 'Duração(d)', 'Até', 'Conclusão(%)',
                        'Notas', 'Time', 'Recurso']);
                    for(var i = 0; i < $scope.listaAtividadesRoot.length; i++) {
                        var inicio = $scope.listaAtividadesRoot[i].inicio ?
                            moment($scope.listaAtividadesRoot[i].inicio.$date).format("DD/MM/YYYY") : " ";
                        var fim = $scope.listaAtividadesRoot[i].fim ?
                            moment($scope.listaAtividadesRoot[i].fim.$date).format("DD/MM/YYYY") : " ";
                        var nomeTime = $scope.listaAtividadesRoot[i].timeObj ?
                            $scope.listaAtividadesRoot[i].timeObj.nome : " ";

                        var nomeRecurso = $scope.listaAtividadesRoot[i].pessoaRecurso ?
                            $scope.listaAtividadesRoot[i].pessoaRecurso.nome : " ";

                        var linha = [
                            $scope.listaAtividadesRoot[i].nome,
                            $scope.listaAtividadesRoot[i].status,
                            inicio,
                            $scope.listaAtividadesRoot[i].duracao ? $scope.listaAtividadesRoot[i].duracao : 0,
                            fim,
                            $scope.listaAtividadesRoot[i].progresso ? $scope.listaAtividadesRoot[i].progresso : 0,
                            $scope.listaAtividadesRoot[i].notas ? $scope.listaAtividadesRoot[i].notas : " ",
                            nomeTime,
                            nomeRecurso
                        ];
                        dados.push(linha);
                    }

                    var excelData = [
                        {
                            "name": "atividades",
                            "data": dados
                        }
                    ];
                    waitingDialog.hide();
                    $scope.excel.down(excelData);
                }
            };

            function loadTable() {
                $scope.listaAtividades = [];
                $rootScope.showLoading = true;
                if($rootScope.usuarioLogado) {
                    var idusuario;
                    if($rootScope.usuarioLogado.perfil === 'gerente') {
                        idusuario = $rootScope.usuarioLogado.subordinado;
                    } else {
                        idusuario = $rootScope.usuarioLogado._id.$oid;
                    }
                    var qTime = {
                        "$or": [
                            {"lider": idusuario},
                            {"recursos": idusuario}
                        ]
                    };
                    Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {
                        if (times[0]) {
                            var prom = [];
                            var atividadesList = [];
                            for (var t = 0; t < times.length; t++) {
                                var aQuery;
                                if(times[t].lider === idusuario) {
                                    aQuery = {
                                        "time": times[t]._id.$oid
                                    };
                                } else {
                                    aQuery = {
                                        "designado": idusuario
                                    };
                                }
                                prom.push(Atividade.query(aQuery).then(function (atividades) {
                                    angular.forEach(atividades, function (atividade) {
                                        var _id = {
                                            "_id": {
                                                "$oid": atividade.time
                                            }
                                        };
                                        var time = $filter('filter')(times, _id);
                                        if (time && time.length > 0) {
                                            time = time[0];
                                            atividade.pessoaLider = {};
                                            atividade.pessoaRecurso = {};
                                            Pessoa.getById(time.lider).then(function (lider) {

                                                var nomes = lider.nome.split(" ");
                                                var iniciais = nomes[0].substring(0, 1);
                                                var nomeSimples = nomes[0];
                                                if (nomes.length > 1) {
                                                    iniciais += nomes[1].substring(0, 1);
                                                }
                                                lider.iniciais = iniciais.toUpperCase();
                                                lider.nomeSimples = nomeSimples;
                                                atividade.pessoaLider = lider;
                                            });

                                            if (atividade.designado) {
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
                                            atividade.timeObj = time;
                                        }
                                    });

                                    atividadesList = atividadesList.concat(atividades);
                                }));

                            }
                            $q.all(prom).then(function () {
                                atividadesList = $filter('unique')(atividadesList, "_id.$oid");
                                $scope.listaAtividades = atividadesList;
                                $scope.listaAtividadesRoot = atividadesList;
                                $scope.filterChange();
                                $rootScope.showLoading = false;
                            });
                        } else {
                            $rootScope.showLoading = false;
                        }
                    });
                }
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
                        $scope.listaAtividades = $filter('filter')($scope.listaAtividadesRoot, filterFunction);
                    } else {
                        $scope.listaAtividades = [];
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

            $scope.initWorkspaceActivities = function () {
                $scope.excel = {down: function() {}};
                $scope.filtro = [true, true, false, false];
                $scope.listaFiltro= ["aguardando", "iniciada", "concluída", "cancelada"];
                $rootScope.collapsed = $state.current.data.collapsed;
                loadTable();
            };
        }]);