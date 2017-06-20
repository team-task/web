angular.module('team-task')
    .controller('WorkspaceProjectsController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$uibModal', '$filter',
        function ($scope, $rootScope, $state, Projeto, Atividade, Time, DTOptionsBuilder, $resource, $uibModal, $filter) {
            $rootScope.showLoading = false;

            $scope.dtOptions = DTOptionsBuilder.newOptions().withDisplayLength(25);

            $scope.initWorkspaceProjects = function () {
                $scope.excel = {down: function() {}};
                $scope.filtro = [true, false, false, false];
                $scope.listaFiltro= ["Ativo", "Suspenso", "Concluído", "Cancelado"];
                $rootScope.collapsed = $state.current.data.collapsed;

                $scope.ganttData = [];
                $scope.ganttOptions= {
                    "zoom": 1,
                    "scale": "week",
                    "width": true,
                    "currentDate": 'line',
                    "tableHeaders": {'model.name': 'Projeto'},
                    "taskContent": '<span></span>',
                    "daily": true,
                    "sortMode": ["from"],
                    "resize": false,
                    "dependencies": {
                        "enabled": true,
                        "readOnly": true
                    },
                    "timeFrames": {
                        closed: {
                            magnet: false,
                            working: false
                        }
                    },
                    "dateFrames": {
                        weekend: {
                            evaluator: function(date) {
                                return date.isoWeekday() === 6 || date.isoWeekday() === 7;
                            },
                            targets: ['closed']
                        }
                    },
                    "movable": false,
                    "contents": {
                        'model.name': '<a ng-click="scope.mostrarDetalheAtividadeGantt(row.model)" ' +
                        'class="pointer-action">{{getValue()}}</a>'
                    },
                    "filtertask": ["Ativo", "Suspenso", "Concluído", "Cancelado"],
                    api: function (api) {
                        $scope.api = api;
                    }
                };

                loadTable();
            };

            function loadTable() {
                $rootScope.showLoading = true;
                $scope.ganttData = [];
                $scope.listaProjetos = [];
                $scope.listaProjetosRoot = [];
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
                                $scope.listaProjetosRoot = projetos;

                                for (var at = 0; at < projetos.length; at++) {
                                    var projeto = projetos[at];
                                    var rowPr = {
                                        "name": projeto.nome,
                                        "projeto": projeto,
                                        "status": projeto.status,
                                        "indiceAt": at
                                    };
                                    rowPr.tasks = [];

                                    var statusColor = projeto.status.toLowerCase() === 'ativo' ? '#5bc0de' :
                                        projeto.status.toLowerCase() === 'suspenso' ? '#f0ad4e' :
                                            projeto.status.toLowerCase() === 'concluído' ? '#5cb85c' : '#d9534f';
                                    if(projeto.inicio) {
                                        rowPr.tasks.push({
                                            "id": projeto._id.$oid,
                                            "name": projeto.nome,
                                            "from": moment(projeto.inicio.$date),
                                            "to": moment(projeto.fim.$date),
                                            "color": statusColor,
                                            "status": projeto.status
                                        });
                                    }

                                    $scope.ganttData.push(rowPr);

                                }

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
                        listaFiltro.push("Ativo");
                    }
                    if ($scope.filtro[1]) {
                        listaFiltro.push("Suspenso");
                    }
                    if ($scope.filtro[2]) {
                        listaFiltro.push("Concluído");
                    }
                    if ($scope.filtro[3]) {
                        listaFiltro.push("Cancelado");
                    }
                    if(listaFiltro.length > 0) {
                        $scope.listaFiltro = listaFiltro;
                        $scope.listaProjetos = $filter('filter')($scope.listaProjetosRoot, filterFunction);
                        $scope.ganttOptions.filtertask = listaFiltro;
                    } else {
                        $scope.listaProjetos = [];
                        $scope.ganttOptions.filtertask = "";
                    }
                }
                if($scope.api) {
                    $scope.api.rows.refresh();
                }
            };

            $scope.filterFunctionGantt = function (item) {

                if(item && item.model) {
                    if($scope.ganttOptions.filtertask) {
                        return $scope.ganttOptions.filtertask.indexOf(item.model.status) > -1;
                    } else {
                        return false;
                    }
                }
            };

            function filterFunction (item) {
                if(item) {
                    if($scope.listaFiltro) {
                        return $scope.listaFiltro.indexOf(item.status) > -1;
                    } else {
                        return false;
                    }
                }
            }

            $scope.exportarTabela = function () {
                if($scope.listaProjetosRoot) {
                    waitingDialog.show('Gerando arquivo. Aguarde.');
                    var dados = [];
                    dados.push(['Projeto', 'Descrição', 'Inicio', 'Duração(d)', 'Até', 'Status',
                        'Notas']);
                    for(var i = 0; i < $scope.listaProjetosRoot.length; i++) {
                        var inicio = $scope.listaProjetosRoot[i].inicio ?
                            moment($scope.listaProjetosRoot[i].inicio.$date).format("DD/MM/YYYY")
                            : "";
                        var fim = $scope.listaProjetosRoot[i].fim ?
                            moment($scope.listaProjetosRoot[i].fim.$date).format("DD/MM/YYYY")
                            : "";
                        var nota = "";
                        //repalce do \n por string de quebra do excel
                        if($scope.listaProjetosRoot[i].notas && $scope.listaProjetosRoot[i].notas.length > 0) {
                            for (var nIndex = 0; nIndex < $scope.listaProjetosRoot[i].notas.length; nIndex++) {
                                nota += $scope.listaProjetosRoot[i].notas[nIndex].data.$date ?
                                    moment($scope.listaProjetosRoot[i].notas[nIndex].data.$date).format("DD/MM/YYYY") + ": "
                                    : "";
                                nota += $scope.listaProjetosRoot[i].notas[nIndex].nota;
                                nota += "&#10;";
                            }
                        }
                        var linha = [
                            $scope.listaProjetosRoot[i].nome,
                            $scope.listaProjetosRoot[i].descricao,
                            inicio,
                            $scope.listaProjetosRoot[i].duracao ? $scope.listaProjetosRoot[i].duracao : 0,
                            fim,
                            $scope.listaProjetosRoot[i].status,
                            nota
                        ];
                        dados.push(linha);
                    }

                    var excelData = [
                        {
                            "name": "projetos",
                            "data": dados
                        }
                    ];
                    waitingDialog.hide();
                    $scope.excel.down(excelData);
                }
            };

            $scope.mostrarNotas = function (projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-notes.html',
                        controller: 'ModalViewNotesController',
                        resolve: {
                            projetoSelecionado: function () {
                                return projeto;
                            }
                        }
                    }).result.then(function () {
                    }, function () {
                    });
            };

            $scope.mostrarDescricao = function (projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-description.html',
                        controller: 'ModalViewDescriptionController',
                        resolve: {
                            projetoSelecionado: function () {
                                return projeto;
                            }
                        }
                    }).result.then(function () {
                    }, function () {
                    });
            };

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
                        $rootScope.$emit("CallLoadProjectMenu", {});
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

