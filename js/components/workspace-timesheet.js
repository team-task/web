angular.module('team-task')
    .controller('WorkspaceTimesheetController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        '$resource', '$filter', 'Pessoa', 'Projeto', '$q', 'DTOptionsBuilder', '$uibModal', 'Hora',
        function ($scope, $rootScope, $state, Atividade, Time, $resource, $filter, Pessoa, Projeto, $q, DTOptionsBuilder,
                  $uibModal, Hora) {
            $scope.timesheets = [];
            $scope.dataPesquisa = moment().toDate();
            $scope.dataStart = moment($scope.dataPesquisa).startOf('day').toDate();
            $scope.dataEnd = moment($scope.dataPesquisa).endOf('day').toDate();
            $scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(25);
            $scope.initWorkspaceTimesheet = function () {
                $scope.events = [];
                if ($rootScope.usuarioLogado) {
                    if ($rootScope.usuarioLogado.perfil === 'gerente') {
                        $scope.idUsuario = $rootScope.usuarioLogado.subordinado;
                    } else {
                        $scope.idUsuario = $rootScope.usuarioLogado._id.$oid;
                    }
                }

                $scope.excel = {
                    down: function () {
                    }
                };

                $scope.mudarMes = function () {
                    $scope.dataStart = moment($scope.dataPesquisa).startOf('day').startOf('month').toDate();
                    $scope.dataEnd = moment($scope.dataPesquisa).endOf('day').endOf('month').toDate();
                    loadTable();
                };

                $scope.mudarMes();

                $scope.mudarData = function () {
                    $scope.dataStart = moment($scope.dataPesquisa).startOf('day').toDate();
                    $scope.dataEnd = moment($scope.dataPesquisa).endOf('day').toDate();
                    loadTable();
                };

                $scope.uiConfig = {
                    calendar:{
                        lang: 'pt-br',
                        height: 'auto',
                        editable: true,
                        header:{
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        views: {
                            month: {
                                titleFormat: 'MMMM YY'
                            }
                        },
                        dayClick: $scope.diaClicado,
                        events: $scope.events
                    }
                };
            };

            $scope.diaClicado = function (date) {
                //angular.element(this).css('background-color', 'red');
                console.log(date, date.toDate());
                $scope.dataPesquisa = date.toDate();
                $scope.mudarData();
            };

            function loadTable() {
                $rootScope.showLoading = true;
                $scope.events = [];
                var query = {
                    'data': {
                        '$gte': {
                            '$date': $scope.dataStart
                        },
                        '$lte': {
                            '$date': $scope.dataEnd
                        }
                    },
                    usuario: $scope.idUsuario
                };
                Hora.query(query).then(function (horas) {
                    var horasMaxima = moment(new Date(1970, 0, 1, 8, 0, 0));
                    $scope.timesheets = horas;
                    var grupos = $filter('groupBy')(horas, 'dataStr');
                    angular.forEach(grupos, function (grupo, key) {
                        var total = moment(new Date(1970, 0, 1, 0, 0, 0));
                        for (var i = 0; i < grupo.length; i++) {
                            var tempoMoment = moment(grupo[i].tempo.$date);
                            total.add(tempoMoment.hour(), 'h').add(tempoMoment.minute(), 'm');
                        }
                        var event = {
                            title: total.format("HH:mm"),
                            start: moment(key).toDate(),
                            allDay: true
                        };
                        if(total.isBefore(horasMaxima)) {
                            event.color = '#a94442';
                        }
                        $scope.events.push(event);
                    });
                    $rootScope.showLoading = false;
                })
            }

            $scope.adicionarHora = function (horaSelecionada) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-timesheet.html',
                        controller: function ($scope, idUsuario, horaSelecionada) {
                            $scope.edicao = false;
                            if(horaSelecionada) {
                                $scope.edicao = true;
                                $scope.hora = horaSelecionada;
                                $scope.hora.data.$date = new Date(horaSelecionada.data.$date);
                                $scope.hora.tempo.$date = new Date(horaSelecionada.tempo.$date);
                            } else {

                                $scope.hora = {
                                    data: {
                                        $date: moment().toDate()
                                    },
                                    tempo: {
                                        $date: new Date(1970, 0, 1, 0, 0, 0)
                                    },
                                    nota: "",
                                    atividade: null,
                                    tipo: "",
                                    usuario: idUsuario
                                };
                            }
                            $scope.listaTipos = [
                                "Analista / Executor de Testes",
                                "Analista / Programador de Sistemas (Ch.Exclusivo, SO)",
                                "Analista de Suporte - Consultoria Processos (HTU)",
                                "Analista de Suporte (Ch.Comum / BO / OI / CallSite)",
                                "Atividade Administrativa de apoio à secretária de diretoria",
                                "Atividade Administrativa de TI (SAP, STF, Reunião)",
                                "Atividades de Auditorias, SOX, GMUD, ICG, outros",
                                "Ausência Legal (férias, licença médica, liberação empresa, banco de horas)",
                                "Especialista Técnico",
                                "Gestão / Coordenação de Equipe",
                                "Gestão de Projetos",
                                "Gestão de Testes",
                                "Gestão Prioridades",
                                "Handover",
                                "Indics Suporte Sists",
                                "Motivo 1",
                                "Motivo 2",
                                "On going (atividade técnica sem chamado, investigação)",
                                "Plantão",
                                "Reunião Técnica / HLE",
                                "Treinamento / Capacitação"
                            ];


                            $scope.showSelectLoading = true;
                            loadAtividades();
                            function loadAtividades() {
                                $scope.listaAtividades = [];
                                $scope.showSelectLoading = true;

                                var qTime = {
                                    "$or": [
                                        {"lider": idUsuario},
                                        {"recursos": idUsuario}
                                    ]
                                };
                                Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {
                                    var proms = [];
                                    if (times[0]) {
                                        var listaTimes = [];
                                        for (var i = 0; i < times.length; i++) {
                                            listaTimes.push(times[i]._id.$oid);
                                        }
                                        proms.push(Atividade.query({"designado": idUsuario}).then(function (atividades) {
                                            angular.forEach(atividades, function (atividade) {
                                                var _id = {
                                                    "_id": {
                                                        "$oid": atividade.time
                                                    }
                                                };
                                                var time = $filter('filter')(times, _id);
                                                if (time && time.length > 0) {
                                                    time = time[0];
                                                    $scope.listaAtividades.push({
                                                        nome: time.nome + " / " + atividade.nome,
                                                        atividade: atividade.nome,
                                                        tipo: 1,
                                                        ids : {
                                                            atividade: atividade.id,
                                                            time: atividade.time
                                                        }
                                                    });
                                                }
                                            });
                                        }));
                                        var pQuery = {
                                            "$or": [
                                                {"administrador": idUsuario}
                                                , {"atividades.designado": idUsuario}]
                                        };
                                        proms.push(Projeto.query(pQuery).then(function (projetos) {
                                            angular.forEach(projetos, function (projeto) {
                                                angular.forEach(projeto.atividades, function (atividade) {
                                                    var timeF = $filter('filter')(times, {_id: {$oid: atividade.time }});
                                                    var nomeTime = "";
                                                    if(timeF && timeF.length > 0){
                                                        nomeTime = " / " + timeF[0].nome;
                                                    }
                                                    if(atividade.designado === idUsuario) {
                                                        $scope.listaAtividades.push({
                                                            nome: projeto.nome + nomeTime + " / " + atividade.nome,
                                                            tipo: 0,
                                                            atividade: atividade.nome,
                                                            ids : {
                                                                projeto: projeto._id.$oid,
                                                                atividade: atividade.id,
                                                                time: atividade.time
                                                            }
                                                        });
                                                    }
                                                })
                                            });
                                        }));
                                        $q.all(proms).then(function () {
                                            $scope.showSelectLoading = false;
                                        });
                                    } else {
                                        $scope.showSelectLoading = false;
                                    }
                                });

                            }

                            $scope.ok = function () {
                                if($scope.hora.data.$date) {
                                    $scope.hora.dataStr = moment($scope.hora.data.$date).format("YYYY-MM-DD");
                                    if ($scope.edicao) {
                                        horaSelecionada.$saveOrUpdate().then(function () {
                                            $scope.$close(true);
                                        });
                                    } else {
                                        var novamaracao = new Hora();
                                        novamaracao = angular.merge(novamaracao, $scope.hora);
                                        novamaracao.$saveOrUpdate().then(function () {
                                            $scope.$close(true);
                                        });
                                    }
                                }
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
                                return horaSelecionada;
                            }
                        }
                    }).result.then(function () {
                        loadTable();
                }, function () {
                });
            };

        }]);