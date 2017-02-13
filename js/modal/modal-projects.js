angular.module('team-task')
    .controller('ModalNewProjectController',
    function ($scope, $rootScope, Projeto, $state) {
        $scope.novoProjeto = new Projeto();
        $scope.novoProjeto.nome = "";
        $scope.novoProjeto.descricao = "";
        $scope.novoProjeto.status = "Ativo";
        $scope.novoProjeto.alerta = "verde";
        $scope.novoProjeto.inicio = null;
        $scope.novoProjeto.fim = null;
        $scope.novoProjeto.notas = "";

        $scope.initModalNewProject = function () {
            $scope.errorProjectName = "";
        };

        $scope.ok = function () {
            if ($scope.novoProjeto.nome) {
                $scope.novoProjeto.administrador = $rootScope.usuarioLogado._id.$oid;
                $scope.novoProjeto.$save().then(function () {
                    $scope.$close(true);
                });
            } else {
                $scope.errorProjectName = "O Nome é obrigatório na criação do projeto.";
            }
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalEditProjectController',
    function ($scope, $rootScope, Projeto, $state, projetoEdicao, $uibModal) {

        $scope.projeto = {};
        $scope.errorProjectName = "";

        $scope.initModalNewProject = function () {
            $scope.projeto = projetoEdicao;
        };

        $scope.deleteProject = function () {
            if ($scope.projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/delete-project.html',
                        controller: function ($scope, projetoExclusao) {
                            $scope.projeto = projetoExclusao;
                            $scope.ok = function () {
                                $scope.$close(true);
                            };
                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };
                        },
                        resolve: {
                            projetoExclusao: function () {
                                return $scope.projeto;
                            }
                        }
                    }).result.then(function () {

                        deleteProject();
                    }, function () {

                    });
            }
        };

        function deleteProject() {
            $scope.projeto.$remove().then(function () {
                $scope.$close(true);
            });
        }

        $scope.novaNota = function (indice) {
            if ($scope.projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-note.html',
                        controller: function ($scope, projetoEdicao, indice) {
                            $scope.projeto = projetoEdicao;
                            $scope.edicao = false;
                            if(indice != undefined) {
                                $scope.nota = projetoEdicao.notas[indice];
                                $scope.edicao = true;
                            } else {
                                $scope.nota = {"data": {"$date": new Date()},"nota": ""};
                            }

                            $scope.ok = function () {
                                if($scope.nota.nota) {
                                    if($scope.edicao) {
                                        //edicao
                                        projetoEdicao.notas[indice].nota = "[Editada " +
                                                moment(new Date()).format("DD/MM/YYYY") +
                                            "] " + $scope.nota.nota;
                                    } else {
                                        //nova
                                        if(projetoEdicao.notas) {
                                            projetoEdicao.notas.push($scope.nota);
                                        } else {
                                            projetoEdicao.notas = [];
                                            projetoEdicao.notas.push($scope.nota);
                                        }
                                    }
                                    $scope.$close(true);
                                }
                            };
                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };
                        },
                        resolve: {
                            projetoEdicao: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {

                    }, function () {

                    });
            }
        };

        $scope.excluirNota = function (indice) {
            if ($scope.projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/delete-note.html',
                        controller: function ($scope, projetoExclusao, indice) {
                            $scope.nota = projetoExclusao.notas[indice];
                            $scope.ok = function () {
                                if(projetoExclusao.notas && projetoExclusao.notas[indice]) {
                                    projetoExclusao.notas.splice(indice, 1);
                                    $scope.$close(true);
                                }
                            };
                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };
                        },
                        resolve: {
                            projetoExclusao: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {}, function () {});
            }
        };

        $scope.ok = function () {
            $scope.errorProjectName = "";
            if ($scope.projeto.nome) {
                $scope.projeto.$saveOrUpdate().then(function () {
                    $scope.$close(true);
                });
            } else {
                $scope.errorProjectName = "O Nome é obrigatório na criação do projeto.";
            }
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalCopyProjectActivityController',
    function ($scope, $rootScope, projetoSelecionado, indice, $uibModal, Projeto) {
        $scope.activityProjetoErro = "";
        $scope.projetoDestino = {};
        $scope.projeto = projetoSelecionado;
        $scope.initModalCopyActivity = function () {
            var pquery = {
                "administrador": $rootScope.usuarioLogado._id.$oid
            };
            Projeto.query(pquery).then(function (projetos) {
                $scope.projetosParaCopia = projetos;
            });
        };

        $scope.ok = function () {
            if($scope.projetoDestino && $scope.projetoDestino._id) {

                waitingDialog.show("Copiando Atividade para Projeto de destino. Aguarde,");
                Projeto.getById($scope.projetoDestino._id.$oid).then(function (projeto) {
                    if(projeto.atividades && projeto.atividades.length > 0) {
                        projeto.atividades.push(projetoSelecionado.atividades[indice]);
                    } else {
                        projeto.atividades = [];
                        projeto.atividades.push(projetoSelecionado.atividades[indice]);
                    }

                    if (projeto.atividades.length > 0) {
                        var menorDataInicio = null;
                        var maiorDataFim = null;
                        for (var i = 0; i < projeto.atividades.length; i++) {
                            if (!menorDataInicio) {
                                menorDataInicio = projeto.atividades[i].inicio.$date;
                            } else {
                                if (moment(menorDataInicio).isAfter(moment(projeto.atividades[i].inicio.$date))) {
                                    menorDataInicio = projeto.atividades[i].inicio.$date;
                                }
                            }
                            if (!maiorDataFim) {
                                maiorDataFim = projeto.atividades[i].fim.$date;
                            } else {
                                if (moment(maiorDataFim).isBefore(moment(projeto.atividades[i].fim.$date))) {
                                    maiorDataFim = projeto.atividades[i].fim.$date;
                                }
                            }
                        }
                        projeto.inicio = {"$date": menorDataInicio};
                        projeto.fim = {"$date": maiorDataFim};
                        projeto.duracao = Math.floor(moment(projeto.fim.$date).businessDiff(moment(projeto.inicio.$date), 'days')) + 1;
                    }
                    projeto.$saveOrUpdate().then(function () {
                        waitingDialog.hide();
                        $scope.$close(true);
                    });
                });
            } else {
                $scope.activityProjetoErro = "O Projeto de destino deve ser selecionado";
            }
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalCutProjectActivityController',
    function ($scope, $rootScope, projetoSelecionado, indice, $uibModal, Projeto) {
        $scope.activityProjetoErro = "";
        $scope.projetoDestino = {};
        $scope.projeto = projetoSelecionado;
        $scope.initModalCutActivity = function () {
            var pquery = {
                "administrador": $rootScope.usuarioLogado._id.$oid,
                "_id": {
                    "$ne": {
                        "$oid": projetoSelecionado._id.$oid
                    }
                }
            };
            Projeto.query(pquery).then(function (projetos) {
                $scope.projetosParaCopia = projetos;
            });
        };

        $scope.ok = function () {
            if($scope.projetoDestino && $scope.projetoDestino._id) {

                waitingDialog.show("Recortando Atividade para Projeto de destino. Aguarde,");
                Projeto.getById($scope.projetoDestino._id.$oid).then(function (projeto) {
                    if(projeto.atividades && projeto.atividades.length > 0) {
                        projeto.atividades.push(projetoSelecionado.atividades[indice]);
                    } else {
                        projeto.atividades = [];
                        projeto.atividades.push(projetoSelecionado.atividades[indice]);
                    }

                    if (projeto.atividades.length > 0) {
                        var menorDataInicio = null;
                        var maiorDataFim = null;
                        for (var i = 0; i < projeto.atividades.length; i++) {
                            if (!menorDataInicio) {
                                menorDataInicio = projeto.atividades[i].inicio.$date;
                            } else {
                                if (moment(menorDataInicio).isAfter(moment(projeto.atividades[i].inicio.$date))) {
                                    menorDataInicio = projeto.atividades[i].inicio.$date;
                                }
                            }
                            if (!maiorDataFim) {
                                maiorDataFim = projeto.atividades[i].fim.$date;
                            } else {
                                if (moment(maiorDataFim).isBefore(moment(projeto.atividades[i].fim.$date))) {
                                    maiorDataFim = projeto.atividades[i].fim.$date;
                                }
                            }
                        }
                        projeto.inicio = {"$date": menorDataInicio};
                        projeto.fim = {"$date": maiorDataFim};
                        projeto.duracao = Math.floor(moment(projeto.fim.$date).businessDiff(moment(projeto.inicio.$date), 'days')) + 1;
                    }
                    projeto.$saveOrUpdate().then(function () {
                        projetoSelecionado.atividades.splice(indice, 1);
                        if (projetoSelecionado.atividades.length > 0) {
                            var menorDataInicio = null;
                            var maiorDataFim = null;
                            for (var i = 0; i < projetoSelecionado.atividades.length; i++) {
                                if (!menorDataInicio) {
                                    menorDataInicio = projetoSelecionado.atividades[i].inicio.$date;
                                } else {
                                    if (moment(menorDataInicio).isAfter(moment(projetoSelecionado.atividades[i].inicio.$date))) {
                                        menorDataInicio = projetoSelecionado.atividades[i].inicio.$date;
                                    }
                                }
                                if (!maiorDataFim) {
                                    maiorDataFim = projetoSelecionado.atividades[i].fim.$date;
                                } else {
                                    if (moment(maiorDataFim).isBefore(moment(projetoSelecionado.atividades[i].fim.$date))) {
                                        maiorDataFim = projetoSelecionado.atividades[i].fim.$date;
                                    }
                                }
                            }
                            projetoSelecionado.inicio = {"$date": menorDataInicio};
                            projetoSelecionado.fim = {"$date": maiorDataFim};
                            projetoSelecionado.duracao = Math.floor(moment(projetoSelecionado.fim.$date).businessDiff(moment(projetoSelecionado.inicio.$date), 'days')) + 1;

                        } else {
                            projetoSelecionado.inicio = null;
                            projetoSelecionado.fim = null;
                            projetoSelecionado.duracao = null;
                        }

                        projetoSelecionado.$saveOrUpdate().then(function () {
                            waitingDialog.hide();
                            $scope.$close(true);
                        });

                    });
                });
            } else {
                $scope.activityProjetoErro = "O Projeto de destino deve ser selecionado";
            }
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalImportProjectActivityController',
    function ($scope, $rootScope, projetoSelecionado, dataAtividades, Projeto) {
        $scope.initModalImportActivity = function () {
            $scope.dataAtividades = [];
            for (var i = 0; i < dataAtividades.data.length; i++) {
                if(dataAtividades.data[i].Atividade) {
                    var atividade = dataAtividades.data[i];
                    atividade.selecionada = true;
                    $scope.dataAtividades.push(atividade);
                }
            }
            $scope.quantidade = $scope.dataAtividades.length;
        };
        $scope.ok = function () {
            waitingDialog.show("Importando atividade(s). Aguarde.");
            for(var i = 0; i < $scope.dataAtividades.length; i++) {
                if($scope.dataAtividades[i].selecionada) {
                    var atividadeNova = {
                        "nome": $scope.dataAtividades[i].Atividade,
                        "status": "Aguardando",
                        "inicio": {"$date": new Date()},
                        "duracao": 1,
                        "fim": {"$date": new Date()},
                        "designado": "",
                        "notas": "",
                        "time": ""
                    };
                    if (projetoSelecionado.atividades) {
                        projetoSelecionado.atividades.push(atividadeNova);
                    } else {
                        projetoSelecionado.atividades = [];
                        projetoSelecionado.atividades.push(atividadeNova);
                    }
                }
            }
            projetoSelecionado.$saveOrUpdate().then(function () {
                waitingDialog.hide();
                $scope.$close(true);
            });
        };
        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });