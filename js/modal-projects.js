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