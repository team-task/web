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
                        Time.query(qTime).then(function (times) {
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
                                            "atividade": atividades[indexTimeAtividade]
                                        };
                                        rowAt.tasks = [];
                                        rowAt.tasks.push({
                                            "name": atividades[indexTimeAtividade].nome,
                                            "from": moment(atividades[indexTimeAtividade].inicio.$date),
                                            "to": moment(atividades[indexTimeAtividade].fim.$date),
                                            "color": "#F1C232"
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
                                                        "projeto": projetos[p],
                                                        "indiceAt": at
                                                    };
                                                    rowPr.tasks = [];
                                                    rowPr.tasks.push({
                                                        "name": projetos[p].atividades[at].nome,
                                                        "from": moment(projetos[p].atividades[at].inicio.$date),
                                                        "to": moment(projetos[p].atividades[at].fim.$date),
                                                        "color": "#9FC5F8"
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

            $scope.initWorkforce = function () {
                $scope.dateFormat = "dddd, DD/MM/YYYY";
                $scope.ganttOptions = {
                    "zoom": 1,
                    "scale": "week",
                    "width": true,
                    "currentDate": 'line',
                    "tableHeaders": {'model.name': 'Atividade'},
                    "daily": true,
                    "sortMode": "from",
                    "contents": {
                        'model.name': '<a ng-click="scope.mostrarDetalheAtividade(row.model)" class="pointer-action">{{getValue()}}</a>' +
                        '&nbsp;<span class="pointer-action fa fa-pencil-square-o"' +
                            'ng-click="scope.editarAtividade(row.model)">'+
                        '</span>'
                    }
                };
                loadTable();
            };
        }]);