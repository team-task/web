angular.module('team-task')
    .controller('WorkspaceProjectsController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$uibModal', '$filter',
        function ($scope, $rootScope, $state, Projeto, Atividade, Time, DTOptionsBuilder, $resource, $uibModal, $filter) {
            $scope.showLoading = false;
            /*
            $scope.dtOptions = DTOptionsBuilder.newOptions()
                .withButtons([{
                    extend: 'excel',
                    text: '<i class="fa fa-file-excel-o"></i>&nbsp;Exportar para Excel'
                }]);
                */

            $scope.initWorkspaceProjects = function () {
                $scope.excel = {down: function() {}};
                $scope.filtro = [true, true, false, false];
                $scope.listaFiltro= ["Ativo", "Suspenso", "Concluído", "Cancelado"];
                loadTable();
            };

            function loadTable() {
                $scope.showLoading = true;

                $scope.listaProjetos = [];
                $scope.listaProjetosRoot = [];
                if($rootScope.usuarioLogado) {
                    var idusuario = $rootScope.usuarioLogado._id.$oid;
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
                    } else {
                        $scope.listaProjetos = [];
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
                    dados.push(['Projeto', 'Inicio', 'Duração(d)', 'Até', 'Status',
                        'Notas', 'Descrição', 'Qtd Atividade']);
                    for(var i = 0; i < $scope.listaProjetosRoot.length; i++) {
                        var inicio = $scope.listaProjetosRoot[i].inicio ?
                            moment($scope.listaProjetosRoot[i].inicio.$date).format("DD/MM/YYYY")
                            : "";
                        var fim = $scope.listaProjetosRoot[i].fim ?
                            moment($scope.listaProjetosRoot[i].fim.$date).format("DD/MM/YYYY")
                            : "";
                        var quantidadeAtv = $scope.listaProjetosRoot[i].atividades ?
                            $scope.listaProjetosRoot[i].atividades.length
                            : 0;
                        var linha = [
                            $scope.listaProjetosRoot[i].nome,
                            inicio,
                            $scope.listaProjetosRoot[i].duracao ? $scope.listaProjetosRoot[i].duracao : 0,
                            fim,
                            $scope.listaProjetosRoot[i].status,
                            $scope.listaProjetosRoot[i].notas,
                            $scope.listaProjetosRoot[i].descricao,
                            quantidadeAtv
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

