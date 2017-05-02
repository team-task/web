angular.module('team-task')
    .controller('WorkspaceTimesheetController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        '$resource', '$filter', 'Pessoa', 'Projeto', '$q', 'DTOptionsBuilder', '$uibModal', 'Hora',
        function ($scope, $rootScope, $state, Atividade, Time, $resource, $filter, Pessoa, Projeto, $q, DTOptionsBuilder,
                  $uibModal, Hora) {
            $scope.timesheets = [];
            $scope.dataPesquisa = moment().toDate();
            $scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(25);
            $scope.initWorkspaceTimesheet = function () {
                if($rootScope.usuarioLogado) {
                    if ($rootScope.usuarioLogado.perfil === 'gerente') {
                        $scope.idUsuario = $rootScope.usuarioLogado.subordinado;
                    } else {
                        $scope.idUsuario = $rootScope.usuarioLogado._id.$oid;
                    }
                }

                $scope.excel = {down: function() {}};
                loadTable();
            };

            function loadTable() {
                $rootScope.showLoading = true;
                var query = {
                    'data' : {
                        '$date' : $scope.dataPesquisa
                    },
                    usuario: $scope.idUsuario
                };
                Hora.query(query).then(function (horas) {
                    $scope.timesheets = horas;
                    $rootScope.showLoading = false;
                })
            }

            $scope.adicionarHora = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-timesheet.html',
                        controller: function ($scope, idUsuario) {
                            $scope.hora = {
                                data: {
                                    $date: moment().toDate()
                                },
                                tempo: {
                                    $date: new Date(1970, 0, 1, 0, 0, 0)
                                },
                                nota: "",
                                projeto: "",
                                tipo: "",
                                usuario: idUsuario
                            };
                            $scope.listaTipos = ["Desenvolvimento", "Documentação"];
                            $scope.showSelectLoading = true;
                            loadAtividades();
                            function loadAtividades () {
                                $scope.listaAtividades = [];
                                $scope.showSelectLoading = false;

                                var qTime = {
                                    "$or": [
                                        {"lider": idUsuario},
                                        {"recursos": idUsuario}
                                    ]
                                };
                                Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {

                                    if (times[0]) {
                                        var listaTimes = [];
                                        for (var i = 0; i < times.length; i++) {
                                            listaTimes.push(times[i]._id.$oid);
                                        }
                                        var pQuery = {
                                            "$or": [
                                                {"administrador": idUsuario}
                                                , {"atividades.designado": idUsuario}]
                                        };
                                        Projeto.query(pQuery).then(function (projetos) {
                                            $scope.listaProjetos = projetos;

                                        });
                                    } else {
                                        $scope.showSelectLoading = false;
                                    }
                                });

                            }

                            $scope.ok = function () {
                                $scope.$close(true);
                            };

                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };
                        },
                        resolve: {
                            idUsuario: function () {
                                return $scope.idUsuario;
                            }
                        }
                    }).result.then(function () {
                }, function () {
                });
            };

            $scope.editarHora = function (hora) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-timesheet.html',
                        controller: function ($scope, idUsuario, horaSelecionada) {
                            $scope.hora = horaSelecionada;
                            $scope.ok = function () {
                                $scope.$close(true);
                            };

                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };
                        },
                        resolve: {
                            idUsuario: function () {
                                return $scope.idUsuario;
                            },
                            horaSelecionada: function () {
                                return hora;
                            }
                        }
                    }).result.then(function () {
                }, function () {
                });
            };
        }]);