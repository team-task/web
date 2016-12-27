angular.module('team-task')
    .controller('WorkforceController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        'Pessoa', '$stateParams', 'Projeto', '$filter', '$uibModal',
        function ($scope, $rootScope, $state, Atividade, Time, Pessoa, $stateParams, Projeto, $filter, $uibModal) {
            $scope.showLoading = false;

            function loadTable() {
                $scope.showLoading = true;

                Pessoa.getById($stateParams.id).then(function (pessoa) {
                    if (pessoa) {

                        var qTime = {
                            "recursos": $stateParams.id
                        };
                        Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {
                            if (times[0]) {
                                var listaTimes = [];
                                for (var i = 0; i < times.length; i++) {
                                    listaTimes.push(times[i]._id.$oid);
                                }

                                $scope.cargaPessoa = pessoa;
                                $scope.ganttData = [];

                                var aQtdQuery = {
                                    "time": {
                                        "$in": listaTimes
                                    },
                                    "designado": pessoa._id.$oid
                                };

                                Atividade.query(aQtdQuery).then(function (atividades) {

                                    for (var indexTimeAtividade = 0; indexTimeAtividade < atividades.length; indexTimeAtividade++) {
                                        var time = $filter('filter')(times, {"_id" : {"$oid" : atividades[indexTimeAtividade].time}});
                                        var nomeTime = "";
                                        if(time && time.length > 0) {
                                            nomeTime = time[0].nome + " / ";
                                        }
                                        var rowAt = {
                                            "name": nomeTime + atividades[indexTimeAtividade].nome,
                                            "time": time,
                                            "status": atividades[indexTimeAtividade].status,
                                            "atividade": atividades[indexTimeAtividade]
                                        };
                                        rowAt.tasks = [];
                                        var listDep = [];

                                        var statusColor =
                                            atividades[indexTimeAtividade].status.toLowerCase() === 'aguardando' ? '#5bc0de' :
                                                atividades[indexTimeAtividade].status.toLowerCase() === 'iniciada' ? '#f0ad4e' : '#5cb85c';

                                        rowAt.tasks.push({
                                            "id": nomeTime + atividades[indexTimeAtividade].nome,
                                            "name": atividades[indexTimeAtividade].nome,
                                            "from": moment(atividades[indexTimeAtividade].inicio.$date),
                                            "to": moment(atividades[indexTimeAtividade].fim.$date),
                                            "color": statusColor,
                                            "status": atividades[indexTimeAtividade].status,
                                            "dependencies": listDep,
                                            "progress": {
                                                "percent": atividades[indexTimeAtividade].progresso,
                                                "color": "#606060"
                                            }
                                        });
                                        $scope.ganttData.push(rowAt);
                                    }

                                    var pQtdQuery = {
                                        "status": "Ativo",
                                        "atividades.designado": pessoa._id.$oid
                                    };
                                    Projeto.query(pQtdQuery).then(function (projetos) {
                                        for (var p = 0; p < projetos.length; p++) {
                                            for (var at = 0; at < projetos[p].atividades.length; at++) {
                                                if (projetos[p].atividades[at].designado === pessoa._id.$oid) {
                                                    var rowPr = {
                                                        "name": projetos[p].nome + " / " + projetos[p].atividades[at].nome,
                                                        "atividade": projetos[p].atividades[at],
                                                        "status": projetos[p].atividades[at].status,
                                                        "projeto": projetos[p],
                                                        "indiceAt": at
                                                    };
                                                    rowPr.tasks = [];
                                                    var listDep = [];
                                                    if(projetos[p].atividades[at].predecessora) {
                                                        listDep.push({"from": projetos[p].atividades[at].predecessora.nomeComposto});
                                                    }

                                                    var statusColor =
                                                        projetos[p].atividades[at].status.toLowerCase() === 'aguardando' ? '#5bc0de' :
                                                            projetos[p].atividades[at].status.toLowerCase() === 'iniciada' ? '#f0ad4e' : '#5cb85c';

                                                    rowPr.tasks.push({
                                                        "id": projetos[p].nome + " / " + projetos[p].atividades[at].nome,
                                                        "name": projetos[p].atividades[at].nome,
                                                        "from": moment(projetos[p].atividades[at].inicio.$date),
                                                        "to": moment(projetos[p].atividades[at].fim.$date),
                                                        "color": statusColor,
                                                        "status": projetos[p].atividades[at].status,
                                                        "dependencies": listDep,
                                                        "progress": {
                                                            "percent": projetos[p].atividades[at].progresso,
                                                            "color": "#606060"
                                                        }
                                                    });
                                                    $scope.ganttData.push(rowPr);
                                                }
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    }
                });

                $scope.showLoading = false;
            }

            $scope.editarAtividade = function (model) {
                if(model.projeto) {
                    $uibModal
                        .open({
                            templateUrl: 'views/modal/edit-activity.html',
                            controller: 'ModalEditActivityController',
                            resolve: {
                                projetoSelecionado: function () {
                                    return model.projeto;
                                },
                                indice: function () {
                                    return model.indiceAt;
                                }
                            }
                        }).result.then(function () {
                            loadTable();
                            $rootScope.$emit("CallLoadMenus", {});
                        }, function () {
                        });
                } else {
                    $uibModal
                        .open({
                            templateUrl: 'views/modal/edit-team-activity.html',
                            controller: 'ModalEditTeamActivityController',
                            resolve: {
                                timeSelecionado: function () {
                                    return model.time[0];
                                },
                                atividadeSelecionada: function () {
                                    return model.atividade;
                                }
                            }
                        }).result.then(function () {
                            loadTable();
                            $rootScope.$emit("CallLoadMenus", {});
                        }, function () {
                        });
                }
            };

            $scope.mostrarDetalheAtividade = function (model) {

                if(model.projeto) {
                    $uibModal
                        .open({
                            templateUrl: 'views/modal/view-activity.html',
                            controller: 'ModalViewActivityController',
                            resolve: {
                                projetoSelecionado: function () {
                                    return model.projeto;
                                },
                                indice: function () {
                                    return model.indiceAt;
                                }
                            }
                        }).result.then(function () {}, function () {});
                } else {
                    $uibModal
                        .open({
                            templateUrl: 'views/modal/view-team-activity.html',
                            controller: 'ModalViewTeamActivityController',
                            resolve: {
                                atividadeSelecionada: function () {
                                    return model.atividade;
                                }
                            }
                        }).result.then(function () {}, function () {});
                }
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

            $scope.datasChange = function () {

                if($scope.fromDate && moment($scope.fromDate).isValid() && moment($scope.fromDate).year() > 2010) {
                    $scope.ganttOptions.fromDate = $scope.fromDate;
                }
                if($scope.toDate && moment($scope.toDate).isValid() && moment($scope.toDate).year() > 2010) {
                    $scope.ganttOptions.toDate = $scope.toDate;
                }
            };

            $scope.initWorkforce = function () {
                $scope.filtro = [true, true, true];
                $scope.dateFormat = "dddd, DD/MM/YYYY";
                $scope.usuarioLogado = $rootScope.usuarioLogado;
                $scope.fromDate = null;
                $scope.toDate = null;
                $scope.ganttOptions = {
                    "zoom": 1,
                    "scale": "week",
                    "width": true,
                    "currentDate": 'line',
                    "tableHeaders": {'model.name': 'Atividade'},
                    "daily": true,
                    "sortMode": ["model.time.nome", "model.projeto.nome", "from"],
                    "taskContent": '<span></span>',
                    "fromDate": undefined,
                    "toDate": undefined,
                    "contents": {
                        'model.name': '<a ng-click="scope.mostrarDetalheAtividade(row.model)" class="pointer-action">{{getValue()}}</a>' +
                        '&nbsp;<span class="pointer-action fa fa-pencil-square-o" ' +
                        'ng-show="row.model.projeto.administrador === scope.usuarioLogado._id.$oid || row.model.time[0].lider === scope.usuarioLogado._id.$oid"' +
                            'ng-click="scope.editarAtividade(row.model)">'+
                        '</span>'
                    },
                    "filtertask": ["aguardando", "iniciada", "concluída"],
                    "tooltipcontent": '{{task.model.name}}<span ng-show="task.model.progress.percent"> - {{task.model.progress.percent}}%</span></br>' +
                    '<small>' +
                    '{{task.isMilestone() === true && getFromLabel() || getFromLabel() + \' - \' + getToLabel()}}' +
                    '</small>',
                    api: function(api) {
                        $scope.api = api;
                    }
                };
                loadTable();
            };
        }]);