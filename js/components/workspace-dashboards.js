angular.module('team-task')
    .controller('WorkspaceDashboardsController', ['$scope', '$rootScope', '$state', '$stateParams', 'Atividade', 'Time',
        '$resource', '$filter', 'Pessoa', 'Projeto', '$q', 'DTOptionsBuilder', '$uibModal', 'Hora', 'uiCalendarConfig',
        function ($scope, $rootScope, $state, $stateParams, Atividade, Time, $resource, $filter, Pessoa, Projeto, $q,
                  DTOptionsBuilder, $uibModal, Hora) {
            $scope.dataPesquisa = moment().toDate();
            $scope.heatmapData = [];
            $scope.initWorkspaceDashboards = function () {
                $scope.daysInMonth = moment($scope.dataPesquisa).daysInMonth();
                $scope.heatmapData = [];
                generateHeatMapData();
            };

            $scope.prevMonth = function () {
                $scope.dataPesquisa = moment($scope.dataPesquisa).subtract(1, 'month').toDate();
                $scope.daysInMonth = moment($scope.dataPesquisa).daysInMonth();
                $scope.heatmapData = [];
                generateHeatMapData();
            };

            $scope.nextMonth = function () {
                $scope.dataPesquisa = moment($scope.dataPesquisa).add(1, 'month').toDate();
                $scope.daysInMonth = moment($scope.dataPesquisa).daysInMonth();
                $scope.heatmapData = [];
                generateHeatMapData();
            };

            function generateHeatMapData() {
                $scope.daysInMonth = moment($scope.dataPesquisa).daysInMonth();
                $scope.datas = [];
                var primeiroDia = moment($scope.dataPesquisa).startOf('month').startOf('day');
                var ultimoDia = moment($scope.dataPesquisa).endOf('month').endOf('day');
                var dia = moment(primeiroDia);
                var tempDia = [];
                var datasStr = [];
                while (dia.month() === primeiroDia.month()) {
                    tempDia.push(Number(dia.format("D")));
                    datasStr.push(dia.format("YYYY-MM-DD"));
                    dia.add(1, 'd');
                }
                $scope.datas = tempDia;
                var qPessoa = {
                    cadastrado: $rootScope.usuarioLogado._id.$oid
                };
                var start = moment(primeiroDia.toDate());
                var end = moment(ultimoDia.toDate());


                Pessoa.query(qPessoa, {
                    s: {'nome': 1},
                    f: {'nome': 1, '_id': 1, 'usuario': 1}
                }).then(function (pessoas) {
                    var query = {
                        'data': {
                            '$gte': {
                                '$date': start.toDate()
                            },
                            '$lte': {
                                '$date': end.toDate()
                            }
                        },
                        usuario: {
                            $in: []
                        }
                    };
                    var tempHeatmapData = [];
                    for (var index = 0; index < pessoas.length; index++) {
                        query.usuario.$in.push(pessoas[index]._id.$oid);

                        var tempHoras = [];
                        for (var j = 0; j < $scope.daysInMonth; j++) {
                            tempHoras.push({
                                recurso: (index + 1),
                                data: (j + 1),
                                horas: 0
                            });
                        }

                        tempHeatmapData.push({
                            recurso: pessoas[index].usuario.toUpperCase(),
                            horas: tempHoras
                        });
                    }
                    Hora.query(query, {sort: {usuario: 1, data: 1}}).then(function (horas) {
                        for (var i = 0; i < datasStr.length; i++) {
                            var horasNaData = $filter('filter')(horas, {dataStr: datasStr[i]});
                            if (horasNaData && horasNaData.length > 0) {
                                for (var z = 0; z < horasNaData.length; z++) {
                                    var usuario = $filter('filter')(pessoas, {_id : {$oid: horasNaData[z].usuario}})[0];
                                    var heatMapRecurso = $filter('filter')(tempHeatmapData, {recurso : usuario.usuario.toUpperCase()})[0];
                                    var tempTempo = moment(horasNaData[z].tempo.$date);
                                    heatMapRecurso.horas[i].horas += (tempTempo.hours() + (tempTempo.minutes() / 60));

                                }
                            }
                        }
                        $scope.heatmapData = tempHeatmapData;
                    });
                });
            }

        }]);