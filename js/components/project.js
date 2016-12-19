angular.module('team-task')
    .controller('ProjectController', ['$scope', '$rootScope', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$q', '$resource', '$uibModal', '$stateParams', 'Pessoa', '$window',
        function ($scope, $rootScope, Projeto, Atividade, Time, DTOptionsBuilder, $q, $resource, $uibModal,
                  $stateParams, Pessoa, $window) {
            $scope.showLoading = false;
            $scope.dtOptions = DTOptionsBuilder.newOptions();//.withLanguage($resource('js/dtOptions.json').get().$promise);
            $scope.dtOptions.withOption('order', [[3, "asc"]]);

            $scope.csvAtividades = [];

            $scope.ganntClick = function () {
                setTimeout(function () {
                    $scope.api.rows.refresh();
                }, 200);
            };

            $scope.initWorkspaceProject = function () {
                $scope.filtro = [true, true, true];
                $scope.listaFiltro= ["aguardando", "iniciada", "concluída"];
                $scope.ganttData = [];
                $scope.ganttOptions= {
                    "zoom": 1,
                    "scale": "week",
                    "width": true,
                    "currentDate": 'line',
                    "tableHeaders": {'model.name': 'Time / Atividade'},
                    "daily": true,
                    "sortMode": ["model.atividade.nomeTime"],
                    "contents": {
                        'model.name': '<a ng-click="scope.mostrarDetalheAtividadeGantt(row.model)" class="pointer-action">{{getValue()}}</a>' +
                        '&nbsp;<span class="pointer-action fa fa-pencil-square-o"' +
                        'ng-click="scope.editarAtividadeGantt(row.model)">' +
                        '</span>'
                    },
                    "filtertask": ["aguardando", "iniciada", "concluída"],
                    api: function (api) {
                        $scope.api = api;
                    }
                };
                loadProject();
            };

            $scope.getHeader = function () {
                return ['Time', 'Atividade', 'Status', 'Inicio', 'Duracao'];
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

            $scope.filterFunctionGantt = function (item) {
                if(item && item.model) {
                    if($scope.ganttOptions.filtertask) {
                        return $scope.ganttOptions.filtertask.indexOf(item.model.status.toLowerCase()) > -1;
                    } else {
                        return false;
                    }
                }
            };

            function loadProject() {
                $scope.showLoading = true;
                $scope.ganttData = [];
                Projeto.getById($stateParams.id).then(function (projeto) {
                    if (projeto) {
                        var prom = [];
                        prom.push(angular.forEach(projeto.atividades, function (atividade, idAtividade) {
                            if (atividade.designado) {
                                Pessoa.getById(atividade.designado).then(function (pessoa) {
                                    if (pessoa) {
                                        var nomes = pessoa.nome.split(" ");
                                        var iniciais = nomes[0].substring(0, 1);
                                        var nomeSimples = nomes[0];
                                        if (nomes.length > 1) {
                                            iniciais += nomes[1].substring(0, 1);
                                        }
                                        pessoa.iniciais = iniciais.toUpperCase();
                                        pessoa.nomeSimples = nomeSimples;

                                        atividade.pessoaDesignado = pessoa;
                                        atividade.nomeDesignado = pessoa.nome;
                                    }
                                });
                            }
                            if (atividade.time) {
                                Time.getById(atividade.time).then(function (time) {
                                    if (time) {
                                        atividade.nomeTime = time.nome;
                                    }
                                });
                            }
                            $scope.csvAtividades.push({
                                "Time": "",
                                "Atividade": atividade.nome,
                                "Status": "Aguardando",
                                "Inicio": "",
                                "Duracao": ""
                            });
                        }));

                        $q.all(prom).then(function () {
                            for (var at = 0; at < projeto.atividades.length; at++) {
                                var atividade = projeto.atividades[at];
                                var rowPr = {
                                    "name": atividade.nomeTime + " / " + atividade.nome,
                                    "atividade": atividade.nome,
                                    "projeto": projeto,
                                    "indiceAt": at
                                };
                                rowPr.tasks = [];
                                var listDep = [];
                                if(atividade.predecessora) {
                                    listDep.push({"from": atividade.predecessora.nomeComposto});
                                }

                                var statusColor = atividade.status.toLowerCase() === 'aguardando' ? '#5bc0de' :
                                atividade.status.toLowerCase() === 'iniciada' ? '#f0ad4e' : '#5cb85c';

                                rowPr.tasks.push({
                                    "id": projeto.nome + " / " + atividade.nome,
                                    "name": atividade.nome,
                                    "from": moment(atividade.inicio.$date),
                                    "to": moment(atividade.fim.$date),
                                    "color": statusColor,
                                    "status": atividade.status,
                                    "dependencies": listDep
                                });
                                $scope.ganttData.push(rowPr);
                            }
                            $scope.projeto = projeto;
                            $scope.showLoading = false;
                        });
                    }
                });
            }

            $scope.copiarAtividade = function (indice) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/copy-activity.html',
                        controller: 'ModalCopyProjectActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.moverAtividade = function (indice) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/cut-activity.html',
                        controller: 'ModalCutProjectActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.editarAtividade = function (indice) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-activity.html',
                        controller: 'ModalEditActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.novaAtividade = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-activity.html',
                        controller: 'ModalNewActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.mostrarDetalheAtividade = function (indice) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-activity.html',
                        controller: 'ModalViewActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {
                    }, function () {
                    });
            };


            $scope.editarAtividadeGantt = function (model) {
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
                            loadProject();
                            $rootScope.$emit("CallLoadMenus", {});
                        }, function () {
                        });
                }
            };

            $scope.mostrarDetalheAtividadeGantt = function (model) {
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
            };

            var customeEventListener = $scope.$on("CallImportTemplate", function(event, contents){
                importTemplate(contents);
                event.stopPropagation();
            });

            function importTemplate (contents) {
                var data = Papa.parse(contents.contents, {header: true});
                waitingDialog.hide();
                importTemplateModal(data);
            }

            function importTemplateModal (data) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/import-activity.html',
                        controller: 'ModalImportProjectActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            dataAtividades: function () {
                                return data;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            }
        }]);
