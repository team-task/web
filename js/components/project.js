angular.module('team-task')
    .controller('ProjectController', ['$scope', '$rootScope', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$q', '$uibModal', '$stateParams', 'Pessoa', '$state', 'md5',
        function ($scope, $rootScope, Projeto, Atividade, Time, DTOptionsBuilder, $q, $uibModal,
                  $stateParams, Pessoa, $state, md5) {
            $rootScope.showLoading = false;
            $scope.dtOptions = DTOptionsBuilder.newOptions();
            $scope.dtOptions.withOption('order', [[3, "asc"]]);
            $scope.dtOptions.withOption('displayLength', 25);

            $scope.csvAtividades = [];

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
                    "filtertask": ["aguardando", "iniciada", "concluída"],
                    api: function (api) {
                        $scope.api = api;
                        api.core.on.ready($scope, function() {
                            if (api.tasks.on.moveBegin) {
                                api.tasks.on.moveEnd($scope,
                                    addEventName('tasks.on.moveEnd', atualizaAtividadeProjeto));
                                api.tasks.on.resizeEnd($scope,
                                    addEventName('tasks.on.resizeEnd', atualizaAtividadeProjeto));
                                api.dependencies.on.add($scope,
                                    addEventName('dependencies.on.add', adicionaDependenciaAtividadeProjeto));
                                api.dependencies.on.remove($scope,
                                    addEventName('dependencies.on.remove', removeDependenciaAtividadeProjeto));
                            }
                        });
                    }
                };
                loadProject();
            };

            var adicionaDependenciaAtividadeProjeto = function (eventName, dependency) {
                if(dependency && dependency.getToTask().model) {
                    var atividadePara = dependency.getToTask().model;
                    var atividadeDe = dependency.task.model;
                    if(atividadePara) {
                        if (atividadePara.from.isSameOrBefore(atividadeDe.to)) {
                            atividadePara.from = atividadeDe.to.businessAdd(1);
                            atividadePara.atividadeObj.inicio.$date = atividadePara.from.toDate();
                            var addDuracao = atividadePara.atividadeObj.duracao;
                            atividadePara.to = moment(atividadePara.from.businessAdd(addDuracao));
                            atividadePara.atividadeObj.fim.$date = atividadePara.to.toDate();
                        }
                        atividadePara.atividadeObj.predecessora = {
                            "id": dependency.getFromTaskId()
                        };
                        atualizaAtividadeProjeto('dependencies.on.add', dependency.task);
                    }
                }
            };

            var removeDependenciaAtividadeProjeto = function (eventName, dependency) {
                if(dependency && dependency.getToTask().model) {
                    var atividadePara = dependency.getToTask().model;
                    atividadePara.atividadeObj.predecessora = null;
                    atualizaAtividadeProjeto('dependencies.on.add', dependency.task);
                }
            };
            
            var atualizaAtividadeProjeto = function(eventName, task) {

                if(task) {
                    //console.log(task.row);

                    if($scope.projeto.atividades.length) {

                        var atividade = $scope.projeto.atividades[task.row.model.indiceAt];
                        atividade.inicio.$date = task.model.from.toDate();
                        atividade.fim.$date = task.model.to.toDate();

                        if(moment(atividade.inicio.$date).isoWeekday() === 6) {
                            atividade.inicio.$date = moment(atividade.inicio.$date).subtract(1, 'd').toDate();
                            task.model.from = moment(atividade.inicio.$date);
                        }
                        if(moment(atividade.inicio.$date).isoWeekday() === 7) {
                            atividade.inicio.$date = moment(atividade.inicio.$date).add(1, 'd').toDate();
                            task.model.from = moment(atividade.inicio.$date);
                        }
                        if(moment(atividade.fim.$date).isoWeekday() === 6) {
                            atividade.fim.$date = moment(atividade.fim.$date).subtract(1, 'd').toDate();
                            task.model.to = moment(atividade.fim.$date);
                        }
                        if(moment(atividade.fim.$date).isoWeekday() === 7) {
                            atividade.fim.$date = (moment(atividade.fim.$date).add(1, 'd')).toDate();
                            task.model.to = moment(atividade.fim.$date);
                        }
                        atividade.duracao =
                            Math.floor(moment(atividade.fim.$date).businessDiff(moment(atividade.inicio.$date), 'days'));

                        var menorDataInicio = null;
                        var maiorDataFim = null;
                        for (var i = 0; i < $scope.projeto.atividades.length; i++) {
                            if (!menorDataInicio) {
                                menorDataInicio = $scope.projeto.atividades[i].inicio.$date;
                            } else {
                                if (moment(menorDataInicio).isAfter(moment($scope.projeto.atividades[i].inicio.$date))) {
                                    menorDataInicio = $scope.projeto.atividades[i].inicio.$date;
                                }
                            }
                            if (!maiorDataFim) {
                                maiorDataFim = $scope.projeto.atividades[i].fim.$date;
                            } else {
                                if (moment(maiorDataFim).isBefore(moment($scope.projeto.atividades[i].fim.$date))) {
                                    maiorDataFim = $scope.projeto.atividades[i].fim.$date;
                                }
                            }
                        }
                        $scope.projeto.inicio = {"$date": menorDataInicio};
                        $scope.projeto.fim = {"$date": maiorDataFim};
                        $scope.projeto.duracao =
                            Math.floor(moment($scope.projeto.fim.$date).businessDiff(moment($scope.projeto.inicio.$date), 'days')) + 1;
                        $rootScope.showLoading = true;
                        $scope.projeto.$saveOrUpdate().then(function () {
                            $rootScope.showLoading = false;
                        });
                    }
                }

                /*
                task.row.model.recurso.ocupacao[task.model.ind].inicio.$date = task.model.from.toDate();
                task.row.model.recurso.ocupacao[task.model.ind].fim.$date = task.model.to.toDate();

                task.row.model.recurso.$saveOrUpdate().then(function(){
                    console.log("funfa mesmo");
                });
                */
            };

            var addEventName = function(eventName, func) {
                return function(data) {
                    return func(eventName, data);
                };
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
                $rootScope.showLoading = true;
                $scope.ganttData = [];
                Projeto.getById($stateParams.id).then(function (projeto) {
                    if (projeto) {
                        var prom = [];
                        prom.push(angular.forEach(projeto.atividades, function (atividade, idAtividade) {
                            if (atividade.time) {
                                Time.getById(atividade.time).then(function (time) {
                                    if (time) {
                                        atividade.nomeTime = time.nome;
                                    }
                                });
                            }
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
                            } else {
                                delete atividade.pessoaDesignado;
                                delete atividade.nomeDesignado;
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
                            if(projeto.atividades) {
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
                                    if (atividade.predecessora) {
                                        listDep.push({"from": atividade.predecessora.id});
                                    }

                                    var statusColor = atividade.status.toLowerCase() === 'aguardando' ? '#5bc0de' :
                                        atividade.status.toLowerCase() === 'iniciada' ? '#f0ad4e' : '#5cb85c';

                                    rowPr.tasks.push({
                                        "id": atividade.id,
                                        "name": atividade.nome,
                                        "from": moment(atividade.inicio.$date),
                                        "to": moment(atividade.fim.$date),
                                        "color": statusColor,
                                        "status": atividade.status,
                                        "atividadeObj": atividade,
                                        "dependencies": listDep
                                    });
                                    $scope.ganttData.push(rowPr);
                                }
                            }
                            if(projeto.administrador === $rootScope.usuarioLogado._id.$oid) {

                                $scope.ganttOptions.resize = true;
                                $scope.ganttOptions.movable = true;
                                $scope.ganttOptions.dependencies.readOnly = false;

                                $scope.ganttOptions.contents = {
                                    'model.name': '<a ng-click="scope.mostrarDetalheAtividadeGantt(row.model)" ' +
                                    'class="pointer-action">{{getValue()}}</a>' +
                                    '&nbsp;<span class="pointer-action fa fa-pencil-square-o"' +
                                    'ng-click="scope.editarAtividadeGantt(row.model)">' +
                                    '</span>'
                                };
                            }

                            $scope.projeto = projeto;
                            $rootScope.showLoading = false;
                        });
                    }
                });
            }

            function editGantt (indice) {
                $rootScope.showLoading = true;
                var atividade = $scope.projeto.atividades[indice];
                for(var a = 0; a < $scope.ganttData.length; a++) {
                    if($scope.ganttData[a].indiceAt === indice) {
                        var statusColor = atividade.status.toLowerCase() === 'aguardando' ? '#5bc0de' :
                            atividade.status.toLowerCase() === 'iniciada' ? '#f0ad4e' : '#5cb85c';
                        $scope.ganttData[a].name = atividade.nomeTime + " / " + atividade.nome;
                        $scope.ganttData[a].atividade = atividade.nome;
                        $scope.ganttData[a].tasks[0].id = atividade.id;
                        $scope.ganttData[a].tasks[0].name = atividade.nome;
                        $scope.ganttData[a].tasks[0].from = moment(atividade.inicio.$date);
                        $scope.ganttData[a].tasks[0].to = moment(atividade.fim.$date);
                        $scope.ganttData[a].tasks[0].color = statusColor;
                        $scope.ganttData[a].tasks[0].status = atividade.status;
                        var listDep = [];
                        if (atividade.predecessora) {
                            listDep.push({"from": atividade.predecessora.id});
                        }
                        $scope.ganttData[a].tasks[0].dependencies = listDep;
                    }
                }
                $rootScope.showLoading = false;
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
                    }).result.then(function (acao) {
                        //loadProject();
                        if(acao === "edicao") {
                            editGantt(indice);
                        } else {
                            loadProject();
                        }
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
                        }).result.then(function (acao) {
                            if(acao === "edicao") {
                                editGantt(model.indiceAt);
                            } else {
                                loadProject();
                            }
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

            $scope.mostrarNotas = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-notes.html',
                        controller: 'ModalViewNotesController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            }
                        }
                    }).result.then(function () {
                    }, function () {
                    });
            };

            $scope.mostrarDescricao = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-description.html',
                        controller: 'ModalViewDescriptionController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            }
                        }
                    }).result.then(function () {
                    }, function () {
                    });
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
                    }).result.then(function (acao) {
                        $rootScope.$emit("CallLoadProjectMenu", {});
                        if(acao === "delete") {
                            $state.go("workspace.projects");
                        } else {
                            loadProject();
                        }

                    }, function () {});
            };
        }]);
