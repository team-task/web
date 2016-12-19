angular.module('team-task')
    .controller('WorkspaceProjectsController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$uibModal',
        function ($scope, $rootScope, $state, Projeto, Atividade, Time, DTOptionsBuilder, $resource, $uibModal) {
            $scope.showLoading = false;
            //$scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);

            $scope.initWorkspaceProjects = function () {
                loadTable();
            };

            function loadTable() {
                $scope.showLoading = true;
                $scope.listaProjetos = [];
                if($rootScope.usuarioLogado) {
                    var idusuario = $rootScope.usuarioLogado._id.$oid;
                    var qTime = {
                        "$or": [
                            {"lider": idusuario},
                            {"recursos": idusuario}
                        ]
                    };
                    Time.query(qTime).then(function (times) {

                        if (times[0]) {
                            var listaTimes = [];
                            for (var i = 0; i < times.length; i++) {
                                listaTimes.push(times[i]._id.$oid);
                            }
                            var pQuery = {
                                "$or": [
                                    {"administrador": idusuario}
                                    , {"atividades.designado": idusuario}]
                            };
                            Projeto.query(pQuery).then(function (projetos) {
                                $scope.listaProjetos = projetos;
                                $scope.showLoading = false;
                            });
                        }
                    });
                }
            }

            $scope.editarProjeto = function (projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-project.html',
                        controller: 'ModalEditProjectController',
                        resolve: {
                            projetoEdicao: function () {
                                return projeto;
                            }
                        }
                    }).result.then(function () {
                        loadTable();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.novoProjeto = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-project.html',
                        controller: 'ModalNewProjectController'
                    }).result.then(function () {
                        loadTable();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            }
        }]);

angular.module('team-task')
    .controller('WorkspaceActivitiesController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$filter', 'Pessoa', '$uibModal',
        function ($scope, $rootScope, $state, Atividade, Time, DTOptionsBuilder, $resource, $filter, Pessoa, $uibModal) {
            $scope.showLoading = false;
            //$scope.dtAOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);
            $scope.dtAOptions = DTOptionsBuilder.newOptions();
            $scope.dtAOptions.withOption('responsive', true);
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

            function loadTable() {
                $scope.listaAtividades = [];
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
                        if (times[0]) {
                            var listaTimes = [];
                            for (var i = 0; i < times.length; i++) {
                                listaTimes.push(times[i]._id.$oid);
                            }
                            var aQuery = {
                                "time": {
                                    "$in": listaTimes
                                }
                            };
                            Atividade.query(aQuery).then(function (atividades) {
                                angular.forEach(atividades, function (atividade, idAtividade) {
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
                                $scope.listaAtividades = atividades;
                                $scope.listaAtividadesRoot = atividades;
                                $scope.filterChange();
                                $scope.showLoading = false;
                            });
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
                $scope.filtro = [true, true, false, false];
                $scope.listaFiltro= ["aguardando", "iniciada", "concluída", "cancelada"];
                loadTable();
            };
        }]);

angular.module('team-task')
    .controller('WorkspaceWorkforceController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        '$resource', '$filter', 'Pessoa', 'Projeto', '$q', 'DTOptionsBuilder', '$uibModal',
        function ($scope, $rootScope, $state, Atividade, Time, $resource, $filter, Pessoa, Projeto, $q, DTOptionsBuilder,
                  $uibModal) {
            $scope.showLoading = false;
            $scope.ganttData = [];
            $scope.listaAtividadesIniciando = [];
            $scope.listaAtividadesTerminando = [];

            $scope.dtOptions = DTOptionsBuilder.newOptions();
            $scope.dtOptions.withOption('order', [[1,"asc"]]);

            $scope.dtOptions2 = DTOptionsBuilder.newOptions();
            $scope.dtOptions2.withOption('order', [[2,"asc"]]);

            function loadTable() {
                $scope.showLoading = true;
                $scope.ganttData = [];
                $scope.listaAtividadesIniciando = [];
                $scope.listaAtividadesTerminando = [];

                var dataIniciando = moment().add(10, 'days');
                var dataTerminando = moment().subtract(5, 'days');
                $scope.dataIniciando = dataIniciando.toDate();
                $scope.dataTerminando = dataTerminando.toDate();
                if($rootScope.usuarioLogado) {
                    var idusuario = $rootScope.usuarioLogado._id.$oid;
                    var qTime = {
                        "$or": [
                            {"lider": idusuario},
                            {"recursos": idusuario}
                        ]
                    };
                    Time.query(qTime).then(function (times) {

                        if (times[0]) {
                            var listaTimes = [];
                            for (var i = 0; i < times.length; i++) {
                                listaTimes.push(times[i]._id.$oid);
                            }

                            var recursosTotais = [];
                            for (var a = 0; a < times.length; a++) {
                                recursosTotais = recursosTotais.concat(times[a].recursos);
                            }
                            recursosTotais = $filter('unique')(recursosTotais);
                            var promisses = [];
                            var aPromisses = [];
                            var listaAtividadesI = [];
                            var listaAtividadesT = [];
                            angular.forEach(recursosTotais, function (rec, idRec) {
                                promisses.push(Pessoa.getById(rec).then(function (pessoa) {
                                    if (pessoa) {

                                        var nomes = pessoa.nome.split(" ");
                                        var iniciais = nomes[0].substring(0, 1);
                                        var nomeSimples = nomes[0];
                                        if (nomes.length > 1) {
                                            iniciais += nomes[1].substring(0, 1);
                                        }
                                        pessoa.iniciais = iniciais.toUpperCase();
                                        pessoa.nomeSimples = nomeSimples;

                                        var row = {
                                            "name": pessoa.nome,
                                            "idpessoa": pessoa._id.$oid
                                        };

                                        var aQtdQuery = {
                                            "time": {
                                                "$in": listaTimes
                                            },
                                            "designado": pessoa._id.$oid
                                        };
                                        Atividade.query(aQtdQuery).then(function (atividades) {

                                            row.tasks = [];

                                            for (var indexTimeAtividade = 0; indexTimeAtividade < atividades.length; indexTimeAtividade++) {
                                                row.tasks.push({
                                                    "name": atividades[indexTimeAtividade].nome,
                                                    "from": moment(atividades[indexTimeAtividade].inicio.$date),
                                                    "to": moment(atividades[indexTimeAtividade].fim.$date),
                                                    "color": "#F1C232",
                                                    "status": atividades[indexTimeAtividade].status
                                                });
                                            }

                                            var pQtdQuery = {
                                                "administrador": idusuario,
                                                "status": "Ativo",
                                                "atividades.designado": pessoa._id.$oid
                                            };
                                            Projeto.query(pQtdQuery).then(function (projetos) {
                                                for (var p = 0; p < projetos.length; p++) {
                                                    for (var at = 0; at < projetos[p].atividades.length; at++) {
                                                        if (projetos[p].atividades[at].designado === pessoa._id.$oid) {

                                                            row.tasks.push({
                                                                "name": projetos[p].atividades[at].nome,
                                                                "from": moment(projetos[p].atividades[at].inicio.$date),
                                                                "to": moment(projetos[p].atividades[at].fim.$date),
                                                                "color": "#F1C232",
                                                                "status": projetos[p].atividades[at].status
                                                            });
                                                        }
                                                    }
                                                }
                                                $scope.ganttData.push(row);
                                            });
                                        });
                                        //tabelas iniciando e terminando.

                                        var aIniciandoQuery = {
                                            "time": {
                                                "$in": listaTimes
                                            },
                                            "designado": pessoa._id.$oid,
                                            "inicio" : {
                                                "$gte" : {
                                                    "$date": dataTerminando.toDate()

                                                },
                                                "$lte": {
                                                    "$date": dataIniciando.toDate()
                                                }
                                            }
                                        };

                                        aPromisses.push(Atividade.query(aIniciandoQuery).then(function (atividades) {
                                            if(atividades.length > 0) {
                                                angular.forEach(atividades, function (atividade, idAtividade) {
                                                    var time = $filter('filter')(times, {"_id" : {"$oid" : atividade.time}});
                                                    var nomeTime = "";
                                                    if(time && time.length > 0) {
                                                        nomeTime = time[0].nome + " / ";
                                                    }
                                                    atividade.timeObj = time[0];
                                                    if(atividade.status === "aguardando" || atividade.status === "iniciada") {
                                                        listaAtividadesI.push({
                                                            "nome": nomeTime + atividade.nome,
                                                            "inicio": atividade.inicio,
                                                            "duracao": atividade.duracao,
                                                            "notas": atividade.notas,
                                                            "fim": atividade.fim,
                                                            "pessoaRecurso": {
                                                                "nome": pessoa.nome,
                                                                "iniciais": pessoa.iniciais
                                                            },

                                                            "atividadeObj": atividade,
                                                            "timeObj": time[0]
                                                        });
                                                    }
                                                });
                                            }
                                        }));
                                        var aTerminandoQuery = {
                                            "time": {
                                                "$in": listaTimes
                                            },
                                            "designado": pessoa._id.$oid,
                                            "fim" : {
                                                "$gte" : {
                                                    "$date": dataTerminando.toDate()

                                                },
                                                "$lte": {
                                                    "$date": dataIniciando.toDate()
                                                }
                                            }
                                        };
                                        aPromisses.push(Atividade.query(aTerminandoQuery).then(function (atividades) {
                                            if(atividades.length > 0) {
                                                angular.forEach(atividades, function (atividade, idAtividade) {
                                                    var time = $filter('filter')(times, {"_id" : {"$oid" : atividade.time}});
                                                    var nomeTime = "";
                                                    if(time && time.length > 0) {
                                                        nomeTime = time[0].nome + " / ";
                                                    }
                                                    atividade.timeObj = time[0];
                                                    if(atividade.status === "aguardando" || atividade.status === "iniciada") {
                                                        listaAtividadesT.push({
                                                            "nome": nomeTime + atividade.nome,
                                                            "fim": atividade.fim,
                                                            "duracao": atividade.duracao,
                                                            "inicio": atividade.inicio,
                                                            "notas": atividade.notas,
                                                            "pessoaRecurso": {
                                                                "nome": pessoa.nome,
                                                                "iniciais": pessoa.iniciais
                                                            },

                                                            "atividadeObj": atividade,
                                                            "timeObj": time[0]
                                                        });
                                                    }
                                                });
                                            }
                                        }));

                                    }
                                }));
                            });

                            $q.all(promisses).then(function () {
                                $scope.showLoading = false;
                                $q.all(aPromisses).then(function () {
                                    $scope.listaAtividadesIniciando = listaAtividadesI;
                                    $scope.listaAtividadesTerminando = listaAtividadesT;
                                });
                            });
                        }
                    });
                }
            }

            $scope.getColumnWidth = function(widthEnabled, scale, zoom) {
                if (!widthEnabled) {
                    return undefined;
                }

                if (scale.match(/.*?week.*?/)) {
                    return 150 * zoom;
                }

                if (scale.match(/.*?month.*?/)) {
                    return 300 * zoom;
                }

                if (scale.match(/.*?quarter.*?/)) {
                    return 500 * zoom;
                }

                if (scale.match(/.*?year.*?/)) {
                    return 800 * zoom;
                }
                return 40 * zoom;
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
                    if(listaFiltro.length > 0) {
                        $scope.ganttOptions.filtertask = listaFiltro;
                    } else {
                        $scope.ganttOptions.filtertask = "";
                    }
                } else {
                    $scope.ganttOptions.filtertask = "";
                }
                $scope.api.rows.refresh();
            };

            $scope.filterFunction = function (item) {
                if(item && item.model) {
                    if($scope.ganttOptions.filtertask) {
                        return $scope.ganttOptions.filtertask.indexOf(item.model.status.toLowerCase()) > -1;
                    } else {
                        return false;
                    }
                }
            };

            $scope.initWorkspaceWorkforce = function () {
                $scope.filtro = [true, true, true];
                $scope.dateFormat = "dddd, DD/MM/YYYY";
                $scope.ganttOptions = {
                    "zoom": 1,
                    "scale": "week",
                    "width": true,
                    "currentDate": 'line',
                    "tableHeaders": {'model.name': 'Recurso'},
                    "sortMode": "model.name",
                    "daily": true,
                    "taskContent": '<span></span>',
                    "contents": {
                        'model.name': '<a ui-sref="workforce({\'id\': row.model.idpessoa})">{{getValue()}}</a>'
                    },
                    "filtertask": ["aguardando", "iniciada", "concluída"],
                    api: function(api) {
                        $scope.api = api;
                    }
                };
                loadTable();
            };
        }]);