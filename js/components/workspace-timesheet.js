angular.module('team-task')
    .controller('WorkspaceTimesheetController', ['$scope', '$rootScope', '$state', '$stateParams', 'Atividade', 'Time',
        '$resource', '$filter', 'Pessoa', 'Projeto', '$q', 'DTOptionsBuilder', '$uibModal', 'Hora', 'uiCalendarConfig',
        function ($scope, $rootScope, $state, $stateParams, Atividade, Time, $resource, $filter, Pessoa, Projeto, $q,
                  DTOptionsBuilder, $uibModal, Hora, uiCalendarConfig) {
            $scope.timesheets = [];
            $scope.dataPesquisa = moment().toDate();
            $scope.dataFiltro = "";
            $scope.dataStart = moment($scope.dataPesquisa).startOf('day').toDate();
            $scope.dataEnd = moment($scope.dataPesquisa).endOf('day').toDate();
            $scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(25);
            var cabecalho = [
                "Gestor", "Funcionário", "Data", "Atividade",
                "Código da SO ou Chamado Exclusivo", "Qtd de Horas (hh:mm)",
                "Qtd em % 	Observação (preenchimento opcional)"];
            $scope.initWorkspaceTimesheet = function () {
                $scope.resourceUserId = $stateParams.id;
                $rootScope.collapsed = $state.current.data.collapsed;
                if ($rootScope.usuarioLogado) {
                    $scope.usuarioPlanilha = "";
                    if ($scope.resourceUserId && $scope.resourceUserId !== $rootScope.usuarioLogado._id.$oid) {
                        $scope.idUsuario = $scope.resourceUserId;
                        Pessoa.getById($scope.resourceUserId).then(function (usuario) {
                            $scope.usuarioPlanilha = usuario.nome;
                        });
                    } else {
                        $scope.idUsuario = $rootScope.usuarioLogado._id.$oid;
                    }
                }

                $scope.eventSources = [{
                    events: function (start, end, b, callback) {
                        var query = {
                            'data': {
                                '$gte': {
                                    '$date': start.startOf('day').toDate()
                                },
                                '$lte': {
                                    '$date': end.endOf('day').toDate()
                                }
                            },
                            usuario: $scope.idUsuario
                        };
                        Hora.query(query).then(function (horas) {
                            var events = [];
                            var horasMaxima = moment(new Date(1970, 0, 1, 8, 0, 0));
                            $scope.timesheets = horas;
                            var grupos = $filter('groupBy')(horas, 'dataStr');
                            var proms = [];
                            proms.push(angular.forEach(grupos, function (grupo, key) {
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
                                if (total.isBefore(horasMaxima)) {
                                    event.color = '#a94442';
                                }
                                events.push(event);
                            }));
                            $q.all(proms).then(function () {
                                callback(events);
                            });
                        });

                    }
                }];
                //cuidado .. funcao de de-para para modificar muito a base
                $scope.dePara = function () {
                    waitingDialog.show("fazendo o de para");
                    var proms = [];
                    Hora.all({limit: 2000}).then(function (horas) {
                        angular.forEach(horas, function (hora) {
                            switch (hora.tipo) {
                                case "Analista / Executor de Testes":
                                    hora.tipo = "Gestão de Projetos e Portfólio";
                                    break;
                                case "Analista / Programador de Sistemas (Ch.Exclusivo, SO)":
                                    hora.tipo = "Gestão de Projetos e Portfólio";
                                    break;
                                case "Analista de Suporte - Consultoria Processos (HTU)":
                                    hora.tipo = "Sustentação e Operação - Incidentes";
                                    break;
                                case "Analista de Suporte (Ch.Comum / BO / OI / CallSite)":
                                    hora.tipo = "Sustentação e Operação - Incidentes";
                                    break;
                                case "Atividade Administrativa de apoio à secretária de diretoria":
                                    hora.tipo = "Atividades Administrativas";
                                    break;
                                case "Atividade Administrativa de TI (SAP, STF, Reunião)":
                                    hora.tipo = "Atividades Administrativas";
                                    break;
                                case "Atividades de Auditorias, SOX, GMUD, ICG, outros":
                                    hora.tipo = "Atividades Administrativas";
                                    break;
                                case "Ausência Legal (férias, licença médica, liberação empresa, banco de horas)":
                                    hora.tipo = "Atividades Administrativas";
                                    break;
                                case "Especialista Técnico":
                                    hora.tipo = "Sustentação e Operação - Requisição de serviço";
                                    break;
                                case "Gestão / Coordenação de Equipe":
                                    hora.tipo = "Gestão da área";
                                    break;
                                case "Gestão de Projetos":
                                    hora.tipo = "Gestão de Projetos e Portfólio";
                                    break;
                                case "Gestão de Testes":
                                    hora.tipo = "Gestão de Projetos e Portfólio";
                                    break;
                                case "Gestão Prioridades":
                                    hora.tipo = "Gestão de Demandas";
                                    break;
                                case "Handover":
                                    hora.tipo = "Atividades Administrativas";
                                    break;
                                case "Indics Suporte Sists":
                                    hora.tipo = "Sustentação e Operação - Incidentes";
                                    break;
                                case "Motivo 1":
                                    hora.tipo = "Atividades Administrativas";
                                    break;
                                case "Motivo 2":
                                    hora.tipo = "Atividades Administrativas";
                                    break;
                                case "On going (atividade técnica sem chamado, investigação)":
                                    hora.tipo = "Sustentação e Operação - Incidentes";
                                    break;
                                case "Plantão":
                                    hora.tipo = "Sustentação e Operação - Incidentes";
                                    break;
                                case "Reunião Técnica / HLE":
                                    hora.tipo = "Gestão de Demandas";
                                    break;
                                case "Treinamento / Capacitação":
                                    hora.tipo = "Atividades Administrativas";
                                    break;
                                default:
                                    break;
                            }

                            proms.push(hora.$saveOrUpdate().then(function () {
                                console.log("saved");
                            }));
                        });
                        $q.all(proms).then(function () {
                            console.log("complete");
                            waitingDialog.hide();
                        });
                    });
                };

                $scope.mudarData = function () {
                    $scope.dataStart = moment($scope.dataPesquisa).startOf('day').toDate();
                    $scope.dataEnd = moment($scope.dataPesquisa).endOf('day').toDate();
                    loadTable();
                };

                function Workbook() {
                    if (!(this instanceof Workbook)) return new Workbook();
                    this.SheetNames = [];
                    this.Sheets = {};
                }

                function sheet_from_array_of_arrays(data) {
                    var ws = {};
                    var range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
                    for (var R = 0; R !== data.length; ++R) {
                        for (var C = 0; C !== data[R].length; ++C) {
                            if (range.s.r > R) range.s.r = R;
                            if (range.s.c > C) range.s.c = C;
                            if (range.e.r < R) range.e.r = R;
                            if (range.e.c < C) range.e.c = C;
                            var cell = {v: data[R][C]};

                            if (cell.v === null) continue;
                            var cell_ref = XLSX.utils.encode_cell({c: C, r: R});

                            if (typeof cell.v === 'number') cell.t = 'n';
                            else if (typeof cell.v === 'boolean') cell.t = 'b';
                            else cell.t = 's';

                            ws[cell_ref] = cell;
                        }
                    }
                    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                    return ws;
                }

                function s2ab(s) {
                    var buf = new ArrayBuffer(s.length);
                    var view = new Uint8Array(buf);
                    for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                    return buf;
                }

                $scope.exportarTabelaEquipe = function () {
                    waitingDialog.show('Gerando arquivo de Equipe. Aguarde.');
                    //exportar só o mês

                    var view = uiCalendarConfig.calendars['timesheet'].fullCalendar('getView');
                    var dateGetted = moment("01 " + view.title, "DD MMMM YY");
                    var start = moment(dateGetted.toDate()).startOf('month').startOf('day');
                    var end = moment(dateGetted.toDate()).endOf('month').endOf('day');
                    var query = {
                        'data': {
                            '$gte': {
                                '$date': start.toDate()
                            },
                            '$lte': {
                                '$date': end.toDate()
                            }
                        },
                        usuario: ""
                    };
                    var qPessoa = {
                        cadastrado: $rootScope.usuarioLogado._id.$oid
                    };
                    Pessoa.query(qPessoa, {
                        s: {'nome': 1},
                        f: {'nome': 1, '_id': 1, 'usuario': 1}
                    }).then(function (pessoas) {
                        var proms = [];
                        var dados = [];
                        var diasNoMes = start.daysInMonth();
                        dados.push(cabecalho);
                        for (var index = 0; index < pessoas.length; index++) {
                            query.usuario = pessoas[index]._id.$oid;
                            var idUsuario = pessoas[index]._id.$oid;
                            (function (idUsuario, proms) {
                                proms.push(Hora.query(query, {sort: {usuario: 1, data: 1}}).then(
                                    function (horas) {
                                        var mDiaPesquisa = moment(start);
                                        var usuario = $filter('filter')(pessoas, {_id: {$oid: idUsuario}})[0];
                                        for (var indice = 0; indice < diasNoMes; indice++) {
                                            var dataStr = mDiaPesquisa.format("YYYY-MM-DD");
                                            var horasFiltro = [];
                                            horasFiltro = $filter('filter')(horas, {dataStr: dataStr});
                                            if (horasFiltro && horasFiltro.length > 0) {
                                                for (var j = 0; j < horasFiltro.length; j++) {
                                                    var linhaLocalizada = [
                                                        $rootScope.usuarioLogado.usuario.toUpperCase(),
                                                        usuario.usuario.toUpperCase(),
                                                        moment(horasFiltro[j].data.$date).format("DD/MM/YYYY"),
                                                        horasFiltro[j].tipo,
                                                        horasFiltro[j].atividade ? horasFiltro[j].atividade.atividade : "",
                                                        moment(horasFiltro[j].tempo.$date).format("H:mm:ss"),
                                                        "",
                                                        horasFiltro[j].nota
                                                    ];
                                                    dados.push(linhaLocalizada);
                                                }
                                            } else {
                                                var linhaVazia = [
                                                    $rootScope.usuarioLogado.usuario.toUpperCase(),
                                                    usuario.usuario.toUpperCase(),
                                                    mDiaPesquisa.format("DD/MM/YYYY"),
                                                    "",
                                                    "",
                                                    "00:00:00",
                                                    "",
                                                    ""
                                                ];
                                                dados.push(linhaVazia);
                                            }
                                            mDiaPesquisa.add(1, "d");
                                        }
                                    }
                                ));
                            })(idUsuario, proms);
                        }

                        $q.all(proms).then(function () {
                            waitingDialog.hide();
                            //$scope.excel.down(excelData);
                            var ws_name = "Timesheet";
                            var wb = new Workbook(), ws = sheet_from_array_of_arrays(dados);
                            wb.SheetNames.push(ws_name);
                            wb.Sheets[ws_name] = ws;
                            var wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
                            saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "Timesheet.xlsx")
                        });
                    });
                };

                $scope.exportarTabela = function () {
                    if ($scope.timesheets) {
                        waitingDialog.show('Gerando arquivo. Aguarde.');
                        //exportar só o mês
                        var view = uiCalendarConfig.calendars['timesheet'].fullCalendar('getView');
                        var dateGetted = moment("01 " + view.title, "DD MMMM YY");
                        var start = moment(dateGetted.toDate()).startOf('month').startOf('day');
                        var end = moment(dateGetted.toDate()).endOf('month').endOf('day');
                        var query = {
                            'data': {
                                '$gte': {
                                    '$date': start.toDate()
                                },
                                '$lte': {
                                    '$date': end.toDate()
                                }
                            },
                            usuario: $scope.idUsuario
                        };
                        Hora.query(query, {sort: {data: 1}}).then(function (horas) {
                            var dados = [];
                            dados.push(cabecalho);

                            var diasNoMes = start.daysInMonth();
                            var mDiaPesquisa = moment(start);
                            for (var indice = 0; indice < diasNoMes; indice++) {
                                var dataStr = mDiaPesquisa.format("YYYY-MM-DD");
                                var horasFiltro = [];
                                horasFiltro = $filter('filter')(horas, {dataStr: dataStr});
                                if (horasFiltro && horasFiltro.length > 0) {
                                    for (var i = 0; i < horasFiltro.length; i++) {
                                        var linhaLocalizada = [
                                            "SCHUNK",
                                            $rootScope.usuarioLogado.usuario.toUpperCase(),
                                            moment(horasFiltro[i].data.$date).format("DD/MM/YYYY"),
                                            horasFiltro[i].tipo,
                                            horasFiltro[i].atividade ? horasFiltro[i].atividade.atividade : "",
                                            moment(horasFiltro[i].tempo.$date).format("H:mm:ss"),
                                            "",
                                            horasFiltro[i].nota
                                        ];
                                        dados.push(linhaLocalizada);
                                    }
                                } else {
                                    var linhaVazia = [
                                        "SCHUNK",
                                        $rootScope.usuarioLogado.usuario.toUpperCase(),
                                        mDiaPesquisa.format("DD/MM/YYYY"),
                                        "",
                                        "",
                                        "0:00",
                                        "",
                                        ""
                                    ];
                                    dados.push(linhaVazia);
                                }
                                mDiaPesquisa.add(1, "d");
                            }
                            waitingDialog.hide();
                            //$scope.excel.down(excelData);
                            var ws_name = "Timesheet";
                            var wb = new Workbook(), ws = sheet_from_array_of_arrays(dados);
                            wb.SheetNames.push(ws_name);
                            wb.Sheets[ws_name] = ws;
                            var wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
                            saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), "Timesheet.xlsx")
                        });
                    }
                };

                $scope.uiConfig = {
                    calendar: {
                        lang: 'pt-br',
                        height: 'auto',
                        editable: false,
                        header: {
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        views: {
                            month: {
                                titleFormat: 'MMMM YY'
                            }
                        },
                        eventSources: $scope.eventSources,
                        dayClick: $scope.diaClicado
                    }
                };
            };
            var tempVar = "";
            var tempColor = "";
            $scope.cancelarFiltro = function () {
                $scope.dataFiltro = "";
                angular.element(tempVar).css('background-color', tempColor);
                uiCalendarConfig.calendars['timesheet'].fullCalendar('refetchEvents');
            };
            $scope.diaRender = function (date, cell) {
                angular.element(cell).on('dblclick', function () {
                    console.log('date', date);
                });
            };
            $scope.diaClicado = function (date) {
                //var iscurrentDate = date.isSame(new Date(), "day");
                if (tempVar === "") {
                    tempColor = angular.element(this).css('background-color');
                    angular.element(this).css('background-color', '#5bc0de');
                    tempVar = this;
                } else {
                    var _color = angular.element(this).css('background-color');
                    angular.element(this).css('background-color', '#5bc0de');
                    angular.element(tempVar).css('background-color', tempColor);
                    tempColor = _color;
                    tempVar = this;
                }
                var start = moment(date).startOf('day').toDate();
                var end = moment(date).endOf('day').toDate();
                //vou informar o filtro.
                $scope.dataFiltro = date.format("DD/MM/YYYY");
                $scope.dataClicada = moment(date.format("YYYY-MM-DD")).startOf('day').toDate();
                //faço o filtro somente na tabela.
                loadTable(start, end);
            };

            function loadTable(start, end) {
                $rootScope.showLoading = true;
                var query = {
                    'data': {
                        '$gte': {
                            '$date': start
                        },
                        '$lte': {
                            '$date': end
                        }
                    },
                    usuario: $scope.idUsuario
                };
                Hora.query(query).then(function (horas) {
                    $scope.timesheets = horas;
                    $rootScope.showLoading = false;
                });
            }

            $scope.adicionarHora = function (horaSelecionada, dataClicada) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-timesheet.html',
                        controller: function ($scope, idUsuario, horaSelecionada, dataClicada) {
                            $scope.edicao = false;
                            $scope.multiplos = false;
                            $scope.quantidadeDias = null;
                            if (horaSelecionada) {
                                $scope.edicao = true;
                                $scope.hora = horaSelecionada;
                                $scope.hora.data.$date = new Date(horaSelecionada.data.$date);
                                $scope.hora.tempo.$date = new Date(horaSelecionada.tempo.$date);

                            } else {
                                var dataSelecao = dataClicada ? moment(dataClicada).toDate() : moment().toDate();
                                $scope.hora = {
                                    data: {
                                        $date: dataSelecao
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
                                "Atividades Administrativas",
                                "Gestão da área",
                                "Gestão de Demandas",
                                "Gestão de Projetos e Portfólio",
                                "Sustentação e Operação - Requisição de serviço",
                                "Sustentação e Operação - Incidentes",
                                "Sustentação e Operação - Monitoramento"
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
                                        var aQuery = {
                                            "designado": idUsuario,
                                            "status": {
                                                "$in": ["aguardando", "iniciada"]
                                            }
                                        };
                                        proms.push(Atividade.query(aQuery).then(function (atividades) {
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
                                                        ids: {
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
                                                , {"atividades.designado": idUsuario}
                                            ],
                                            "status": "Ativo"
                                        };
                                        proms.push(Projeto.query(pQuery).then(function (projetos) {
                                            angular.forEach(projetos, function (projeto) {
                                                angular.forEach(projeto.atividades, function (atividade) {
                                                    if (atividade.status === "Aguardando" || atividade.status === "Iniciada") {
                                                        var timeF = $filter('filter')(times, {_id: {$oid: atividade.time}});
                                                        var nomeTime = "";
                                                        if (timeF && timeF.length > 0) {
                                                            nomeTime = " / " + timeF[0].nome;
                                                        }
                                                        if (atividade.designado === idUsuario) {
                                                            $scope.listaAtividades.push({
                                                                nome: projeto.nome + nomeTime + " / " + atividade.nome,
                                                                tipo: 0,
                                                                atividade: projeto.nome,
                                                                ids: {
                                                                    projeto: projeto._id.$oid,
                                                                    atividade: atividade.id,
                                                                    time: atividade.time
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            });
                                        }));
                                        $q.all(proms).then(function () {
                                            if ($scope.hora.atividade) {
                                                var atv = $filter('filter')($scope.listaAtividades, {nome: $scope.hora.atividade.nome});
                                                if (atv.length > 0) {
                                                    var indexList = $scope.listaAtividades.indexOf(atv[0]);
                                                    if (indexList > -1) {
                                                        $scope.listaAtividades[indexList] = $scope.hora.atividade;
                                                    }
                                                }
                                            }
                                            $scope.showSelectLoading = false;
                                        });
                                    } else {
                                        $scope.showSelectLoading = false;
                                    }
                                });

                            }

                            $scope.ok = function () {
                                if ($scope.hora.data.$date) {
                                    $scope.hora.dataStr = moment($scope.hora.data.$date).format("YYYY-MM-DD");
                                    if ($scope.edicao) {
                                        horaSelecionada.$saveOrUpdate().then(function () {
                                            $scope.$close(true);
                                        });
                                    } else {
                                        //multiplos dias foi marcado.
                                        if ($scope.multiplos && $scope.quantidadeDias > 0) {
                                            var horaClone = angular.copy($scope.hora);
                                            var loops = [];
                                            for (var idx = 0; idx < $scope.quantidadeDias; idx++) {
                                                if (idx !== 0) {
                                                    var dia = horaClone.data.$date;
                                                    horaClone.data.$date = moment(dia).businessAdd(1).toDate();
                                                    horaClone.dataStr = moment(horaClone.data.$date).format("YYYY-MM-DD");
                                                }
                                                var novamaracaoLoop = new Hora();
                                                novamaracaoLoop = angular.merge(novamaracaoLoop, horaClone);
                                                loops.push(novamaracaoLoop.$saveOrUpdate().then(function () {
                                                }));
                                            }

                                            $q.all(loops).then(function () {
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
                                }
                            };

                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };

                            $scope.delete = function (hora) {
                                $uibModal
                                    .open({
                                        templateUrl: 'views/modal/delete-timesheet.html',
                                        controller: function ($scope, hora) {
                                            $scope.hora = hora;
                                            $scope.ok = function () {
                                                $scope.$close(true);
                                            };
                                            $scope.cancel = function () {
                                                $scope.$dismiss();
                                            };
                                        },
                                        resolve: {
                                            hora: function () {
                                                return hora;
                                            }
                                        }
                                    })
                                    .result.then(function () {
                                    hora.$remove().then(function () {
                                        $scope.$close(true);
                                    });
                                }, function () {
                                });

                            }
                        },
                        resolve: {
                            idUsuario: function () {
                                return $scope.idUsuario;
                            },
                            horaSelecionada: function () {
                                return horaSelecionada;
                            },
                            dataClicada: function () {
                                return dataClicada;
                            }
                        }
                    })
                    .result.then(function () {
                    uiCalendarConfig.calendars['timesheet'].fullCalendar('refetchEvents');
                }, function () {
                });
            };

        }]);