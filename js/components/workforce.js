angular.module('team-task')
    .controller('WorkforceController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        'Pessoa', '$stateParams', 'Projeto',
        function ($scope, $rootScope, $state, Atividade, Time, Pessoa, $stateParams, Projeto) {
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

                                        var rowAt = {
                                            "name": atividades[indexTimeAtividade].nome
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
                                                        "name": projetos[p].atividades[at].nome
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

            $scope.initWorkforce = function () {
                $scope.dateFormat = "dddd, DD/MM/YYYY";
                $scope.ganttOptions = {
                    "zoom": 1,
                    "scale": 'day',
                    "width": true,
                    "currentDate": 'line',
                    "tableHeaders": {'model.name': 'Atividade'},
                    "sortMode": "model.name"
                };
                loadTable();
            };
        }]);