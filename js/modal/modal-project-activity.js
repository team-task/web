angular.module('team-task')
    .controller('ModalNewActivityController',
    function ($scope, $rootScope, projetoSelecionado, $state, Time, Pessoa, md5) {

        $scope.projeto = projetoSelecionado;
        $scope.atividadeNova = {};
        $scope.listaRecursos = [];
        $scope.showSelectLoading = false;

        $scope.initModalNewActivity = function () {
            $scope.atividadeNova = {
                "nome": "",
                "status": "Aguardando",
                "inicio": {"$date": new Date()},
                "duracao": 1,
                "fim": {"$date": new Date()},
                "designado": "",
                "notas": "",
                "time": "",
                "progresso": 0
            };
            $scope.listaTimes = [];

            var idusuario = $rootScope.usuarioLogado._id.$oid;
            var qTime = {"lider": idusuario};
            Time.query(qTime, {'sort': {'nome': 1}}).then(function (times) {

                if (times[0]) {
                    $scope.listaTimes = times;
                }
            });

        };

        $scope.calculaFim = function () {
            if ($scope.atividadeNova.duracao !== 0 && $scope.atividadeNova.inicio.$date) {
                $scope.atividadeNova.fim.$date = moment($scope.atividadeNova.inicio.$date).businessAdd(($scope.atividadeNova.duracao - 1)).toDate();
            } else {
                $scope.atividadeNova.fim.$date = null;
            }
        };

        $scope.carregaPessoas = function () {
            $scope.listaRecursos = [];
            $scope.showSelectLoading = true;
            if ($scope.atividadeNova.time) {
                Time.getById($scope.atividadeNova.time).then(function (time) {
                    if (time) {
                        var arrayOids = [];
                        for (var i = 0; i < time.recursos.length; i++) {
                            arrayOids.push({"$oid": time.recursos[i]});
                        }
                        var pQuery = {
                            "_id": {
                                "$in": arrayOids
                            }
                        };
                        Pessoa.query(pQuery).then(function (pessoas) {
                            if (pessoas[0]) {
                                $scope.listaRecursos = pessoas;
                                $scope.showSelectLoading = false;
                            }
                        })
                    }
                });
            }
        };

        function novaAtividadeValida() {
            var valido = true;
            $scope.activityNameErro = "";
            $scope.activityInicioErro = "";
            $scope.activityDuracaoErro = "";
            $scope.activityTimeErro = "";

            if (!$scope.atividadeNova.nome) {
                $scope.activityNameErro = "O Nome é obrigatório na criação da atividade.";
                valido = false;
            }

            if (!$scope.atividadeNova.inicio.$date) {
                $scope.activityInicioErro = "O Inicio é obrigatório na criação da atividade.";
                valido = false;
            }

            if (!$scope.atividadeNova.duracao || $scope.atividadeNova.duracao === 0) {
                $scope.activityDuracaoErro = "A Duração é obrigatório  e deve ser maior que zero na criação da atividade.";
                valido = false;
            }

            if (!$scope.atividadeNova.time) {
                $scope.activityTimeErro = "O Time é obrigatorio na criação da atividade.";
                valido = false;
            }


            return valido;
        }

        $scope.ok = function () {

            if (novaAtividadeValida()) {
                waitingDialog.show('Salvando atividade. Aguarde');
                var inicioAtividade = $scope.atividadeNova.inicio.$date;
                var fimAtividade = $scope.atividadeNova.fim.$date;

                //possui a data inicio
                if (projetoSelecionado.inicio && projetoSelecionado.inicio.$date) {
                    //verficar se data da atividade é menor que a do projeto para poder atualizar
                    if (moment(projetoSelecionado.inicio.$date).isAfter(moment(inicioAtividade))) {
                        projetoSelecionado.inicio.$date = inicioAtividade;
                    }
                } else {
                    if (projetoSelecionado.inicio) {
                        projetoSelecionado.inicio.$date = inicioAtividade;
                    } else {

                        projetoSelecionado.inicio = {
                            "$date": inicioAtividade
                        }
                    }
                }

                if (projetoSelecionado.fim && projetoSelecionado.fim.$date) {
                    if (moment(projetoSelecionado.fim.$date).isBefore(moment(fimAtividade))) {
                        projetoSelecionado.fim.$date = fimAtividade;
                    }
                } else {
                    if (projetoSelecionado.fim) {
                        projetoSelecionado.fim.$date = fimAtividade;
                    } else {
                        projetoSelecionado.fim = {
                            "$date": fimAtividade
                        }
                    }
                }

                $scope.atividadeNova.atividadeId =
                    md5.createHash(projetoSelecionado.nome + $scope.atividadeNova.nome + $scope.atividadeNova.time);
                if (projetoSelecionado.atividades) {
                    projetoSelecionado.atividades.push($scope.atividadeNova);
                } else {
                    projetoSelecionado.atividades = [];
                    projetoSelecionado.atividades.push($scope.atividadeNova);
                }

                projetoSelecionado.duracao = Math.floor(moment(projetoSelecionado.fim.$date).businessDiff(moment(projetoSelecionado.inicio.$date), 'days')) + 1;

                projetoSelecionado.$saveOrUpdate().then(function () {
                    waitingDialog.hide();
                    $scope.$close(true);
                });
            }
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalViewNotesController',
    function ($scope, projetoSelecionado) {
        $scope.initModalViewNotesActivity = function () {
            $scope.projeto = projetoSelecionado;
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalViewDescriptionController',
    function ($scope, projetoSelecionado) {
        $scope.initModalViewDescriptionActivity = function () {
            $scope.projeto = projetoSelecionado;
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalViewActivityController',
    function ($scope, projetoSelecionado, indice, Pessoa, Time) {
        $scope.indice = 0;

        $scope.initModalEditActivity = function () {
            $scope.indice = indice;
            $scope.listaTimes = [];

            if (projetoSelecionado.atividades[indice].inicio.$date) {
                projetoSelecionado.atividades[indice].inicio.$date =
                    moment(projetoSelecionado.atividades[indice].inicio.$date).toDate();
                projetoSelecionado.atividades[indice].fim.$date =
                    moment(projetoSelecionado.atividades[indice].fim.$date).toDate();
            }

            if (projetoSelecionado.atividades[indice].time) {
                Time.getById(projetoSelecionado.atividades[indice].time).then(function (time) {
                    if (time) {
                        $scope.time = time;
                    }
                })
            }

            if (projetoSelecionado.atividades[indice].designado) {
                Pessoa.getById(projetoSelecionado.atividades[indice].designado).then(function (designado) {
                    if (designado) {
                        $scope.designado = designado;
                    }
                })
            }
            $scope.projeto = projetoSelecionado;
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalEditActivityController',
    function ($scope, $rootScope, projetoSelecionado, indice, $state, Time, Pessoa, Atividade, Projeto,
              $uibModal, $filter, $q) {
        $scope.projeto = {};
        $scope.indice = 0;
        $scope.listaRecursos = [];
        $scope.showSelectLoading = false;
        $scope.showPredecessorLoading = false;

        $scope.initModalEditActivity = function () {
            $scope.indice = indice;
            $scope.listaTimes = [];
            if(!projetoSelecionado.atividades[indice].predecessora) {
                projetoSelecionado.atividades[indice].predecessora = null;
            }
            if (projetoSelecionado.atividades[indice].inicio.$date) {
                projetoSelecionado.atividades[indice].inicio.$date =
                    moment(projetoSelecionado.atividades[indice].inicio.$date).toDate();
                projetoSelecionado.atividades[indice].fim.$date =
                    moment(projetoSelecionado.atividades[indice].fim.$date).toDate();
            }
            $scope.projeto = projetoSelecionado;

            var idusuario = $rootScope.usuarioLogado._id.$oid;
            var qTime = {"lider": idusuario};
            Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {
                if (times[0]) {
                    $scope.listaTimes = times;
                    //if (projetoSelecionado.atividades[indice].designado) {
                    $scope.carregaPessoas();
                    //}
                }
            });

            if(projetoSelecionado.atividades[indice].designado) {
                carregaListaPredecessoras (projetoSelecionado.atividades[indice].designado);
            }

        };

        function carregaListaPredecessoras (idPessoa) {
            $scope.showPredecessorLoading = true;
            $scope.atividadesPossiveis = [];
            var promisses = [];
            var aQuery = { "designado": idPessoa };
            var pQuery = { "atividades.designado": idPessoa };
            promisses.push(Atividade.query(aQuery).then(function (atividades) {
                for (var i = 0; i < atividades.length; i++) {
                    var predecessora = {
                        "nome": atividades[i].nome,
                        "inicio": atividades[i].inicio.$date,
                        "fim": atividades[i].fim.$date,
                        "atividadeId": atividades[i]._id.$oid
                    };
                    var timeTemp;
                    var timeProm = [
                        Time.getById(atividades[i].time).then(function (time) {
                            timeTemp = time;
                        })
                    ];
                    $q.all(timeProm).then(function () {
                        predecessora.nomeComposto = timeTemp.nome + " / " + predecessora.nome;
                        $scope.atividadesPossiveis.push(predecessora);
                    });
                }
            }));

            promisses.push(Projeto.query(pQuery).then(function (projetos) {
                for (var j = 0; j < projetos.length; j++) {
                    //verificar se nao estou no mesmo e se a atividade nao é a mesma.
                    lAtividades: for (var a = 0; a < projetos[j].atividades.length; a++) {
                        if(projetos[j]._id.$oid === projetoSelecionado._id.$oid && a === indice) {
                            continue lAtividades;
                        }
                        //é da pessoa mesmo
                        if(projetos[j].atividades[a].designado === idPessoa) {
                            var predecessora = {
                                "nome": projetos[j].atividades[a].nome,
                                "nomeComposto": projetos[j].nome + " / " + projetos[j].atividades[a].nome,
                                "inicio": projetos[j].atividades[a].inicio.$date,
                                "fim": projetos[j].atividades[a].fim.$date,
                                "projetoId": projetos[j]._id.$oid,
                                "atividadeIndice": a
                            };
                            $scope.atividadesPossiveis.push(predecessora);
                        }
                    }
                }
            }));

            $q.all(promisses).then(function () {
                if($scope.projeto.atividades[$scope.indice].predecessora) {
                    var newArray = $filter('removeWith')
                        ($scope.atividadesPossiveis,
                            {
                                "nomeComposto" : $scope.projeto.atividades[$scope.indice].predecessora.nomeComposto
                            }
                        );
                    newArray.push($scope.projeto.atividades[$scope.indice].predecessora);
                    $scope.atividadesPossiveis = newArray;
                }
                $scope.showPredecessorLoading = false;
            });
        }

        $scope.recalcularInicio = function () {
            if($scope.projeto.atividades[$scope.indice].predecessora) {
                if($scope.projeto.atividades[$scope.indice].predecessora.fim) {
                    $scope.projeto.atividades[$scope.indice].inicio.$date =
                        moment($scope.projeto.atividades[$scope.indice].predecessora.fim).businessAdd(1).toDate();
                    $scope.calculaFim();
                }
            }

        };

        $scope.calculaFim = function () {
            if ($scope.projeto.atividades[$scope.indice].duracao !== 0 && $scope.projeto.atividades[$scope.indice].inicio.$date) {
                $scope.projeto.atividades[$scope.indice].fim.$date =
                    moment($scope.projeto.atividades[$scope.indice].inicio.$date).businessAdd(
                        ($scope.projeto.atividades[$scope.indice].duracao - 1)).toDate();
            } else {
                $scope.projeto.atividades[$scope.indice].fim.$date = null;
            }
        };

        $scope.carregaPessoas = function () {
            $scope.listaRecursos = [];
            $scope.showSelectLoading = true;
            if (projetoSelecionado.atividades[indice].time) {
                Time.getById(projetoSelecionado.atividades[indice].time).then(function (time) {
                    if (time) {
                        var arrayOids = [];
                        for (var i = 0; i < time.recursos.length; i++) {
                            arrayOids.push({"$oid": time.recursos[i]});
                        }
                        var pQuery = {
                            "_id": {
                                "$in": arrayOids
                            }
                        };
                        Pessoa.query(pQuery).then(function (pessoas) {
                            if (pessoas[0]) {
                                $scope.listaRecursos = pessoas;
                                $scope.showSelectLoading = false;
                            }
                        })
                    }
                });
            }
        };

        function editacaoAtividadeValida() {
            var valido = true;
            $scope.activityNameErro = "";
            $scope.activityInicioErro = "";
            $scope.activityDuracaoErro = "";
            $scope.activityTimeErro = "";

            if (!$scope.projeto.atividades[$scope.indice].nome) {
                $scope.activityNameErro = "O Nome é obrigatório na criação da atividade.";
                valido = false;
            }

            if (!$scope.projeto.atividades[$scope.indice].inicio.$date) {
                $scope.activityInicioErro = "O Inicio é obrigatório na criação da atividade.";
                valido = false;
            }

            if (!$scope.projeto.atividades[$scope.indice].duracao || $scope.projeto.atividades[$scope.indice].duracao === 0) {
                $scope.activityDuracaoErro = "A Duração é obrigatório  e deve ser maior que zero na criação da atividade.";
                valido = false;
            }

            if (!$scope.projeto.atividades[$scope.indice].time) {
                $scope.activityTimeErro = "O Time é obrigatorio na criação da atividade.";
                valido = false;
            }

            return valido;
        }

        $scope.ok = function () {

            if (editacaoAtividadeValida()) {
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

                if(projetoSelecionado.atividades[indice].status === "Concluída") {
                    projetoSelecionado.atividades[indice].progresso = 100;
                }

                projetoSelecionado.$saveOrUpdate().then(function () {
                    $scope.$close(true);
                });
            }
        };

        $scope.deleteActivity = function () {
            if ($scope.projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/delete-activity.html',
                        controller: function ($scope, atividadeExclusao) {
                            $scope.atividade = atividadeExclusao;
                            $scope.ok = function () {
                                $scope.$close(true);
                            };
                            $scope.cancel = function () {
                                $scope.$dismiss();
                            };
                        },
                        resolve: {
                            atividadeExclusao: function () {
                                return $scope.projeto.atividades[$scope.indice];
                            }
                        }
                    }).result.then(function () {
                        executeDeleteActivity();
                    }, function () {

                    });
            }
        };

        function executeDeleteActivity() {
            waitingDialog.show('Excluido atividade. Aguarde');
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
        }

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });