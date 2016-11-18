angular.module('team-task')
    .controller('ModalNewProjectController',
    function ($scope, $rootScope, Projeto, $state) {
        $scope.novoProjeto = new Projeto();
        $scope.novoProjeto.nome = "";
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

        $scope.ok = function () {
            $scope.projeto.$saveOrUpdate().then(function () {
                $scope.$close(true);
            });
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalNewActivityController',
    function ($scope, $rootScope, projetoSelecionado, $state, Time, Pessoa) {

        $scope.projeto = projetoSelecionado;
        $scope.atividadeNova = {};
        $scope.time = {};
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
                "notas": ""
            };
            $scope.listaTimes = [];

            var idusuario = $rootScope.usuarioLogado._id.$oid;
            var qTime = {"lider": idusuario};
            Time.query(qTime).then(function (times) {

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
            if ($scope.time) {
                Time.getById($scope.time._id.$oid).then(function (time) {
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
                    if(projetoSelecionado.inicio) {
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
                    if(projetoSelecionado.fim) {
                        projetoSelecionado.fim.$date = fimAtividade;
                    } else {
                        projetoSelecionado.fim = {
                            "$date" : fimAtividade
                        }
                    }
                }

                if(projetoSelecionado.atividades) {
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
    .controller('ModalEditActivityController',
    function ($scope, $rootScope, projetoSelecionado, indice, $state, Time, Pessoa, $uibModal, $filter) {
        $scope.projeto = {};
        $scope.indice = 0;
        $scope.time = {};
        $scope.listaRecursos = [];
        $scope.showSelectLoading = false;

        $scope.initModalEditActivity = function () {
            $scope.indice = indice;
            $scope.listaTimes = [];
            if(projetoSelecionado.atividades[indice].inicio.$date) {
                projetoSelecionado.atividades[indice].inicio.$date =
                    moment(projetoSelecionado.atividades[indice].inicio.$date).toDate();
                projetoSelecionado.atividades[indice].fim.$date =
                    moment(projetoSelecionado.atividades[indice].fim.$date).toDate();
            }
            $scope.projeto = projetoSelecionado;

            var idusuario = $rootScope.usuarioLogado._id.$oid;
            var qTime = {"lider": idusuario};
            Time.query(qTime).then(function (times) {
                if (times[0]) {
                    $scope.listaTimes = times;
                    if(projetoSelecionado.atividades[indice].designado) {
                        var timeParaRecurso = $filter("filter")(times, {"recursos": projetoSelecionado.atividades[indice].designado});
                        if(timeParaRecurso.length > 0) {
                            $scope.time = timeParaRecurso[0];
                        }
                        $scope.carregaPessoas();
                    }
                }
            });

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
            if ($scope.time) {
                Time.getById($scope.time._id.$oid).then(function (time) {
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


            return valido;
        }

        $scope.ok = function () {

            if (editacaoAtividadeValida()) {
                var inicioAtividade = $scope.projeto.atividades[$scope.indice].inicio.$date;
                var fimAtividade = $scope.projeto.atividades[$scope.indice].fim.$date;

                //possui a data inicio
                if (projetoSelecionado.inicio && projetoSelecionado.inicio.$date) {
                    //verficar se data da atividade é menor que a do projeto para poder atualizar
                    if (moment(projetoSelecionado.inicio.$date).isAfter(moment(inicioAtividade))) {
                        projetoSelecionado.inicio.$date = inicioAtividade;
                    }
                } else {
                    if(projetoSelecionado.inicio) {
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
                    if(projetoSelecionado.fim) {
                        projetoSelecionado.fim.$date = fimAtividade;
                    } else {
                        projetoSelecionado.fim = {
                            "$date" : fimAtividade
                        }
                    }
                }

                projetoSelecionado.duracao = Math.floor(moment(projetoSelecionado.fim.$date).businessDiff(moment(projetoSelecionado.inicio.$date), 'days')) + 1;

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

        function executeDeleteActivity () {
            waitingDialog.show('Excluido atividade. Aguarde');
            projetoSelecionado.atividades.splice(indice, 1);
            if(projetoSelecionado.atividades.length > 0) {
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
                projetoSelecionado.inicio = { "$date": menorDataInicio };
                projetoSelecionado.fim = { "$date": maiorDataFim };
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

angular.module('team-task')
    .controller('ModalEditTeamController',
    function ($scope, timeSelecionado) {

        $scope.initModalEditTeam = function () {

        };

        $scope.ok = function () {
            $scope.$close(true);
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalViewTeamController',
    function ($scope, timeSelecionado) {

        $scope.initModalViewTeam = function () {

        };

        $scope.ok = function () {
            $scope.$close(true);
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalNewTeamController',
    function ($scope, $rootScope, Time) {
        $scope.timeNovo = {};
        $scope.recursosPessoas = [];
        $scope.initModalNewTeam = function () {
            var idusuario = $rootScope.usuarioLogado._id.$oid;
            $scope.timeNovo = new Time();
            $scope.timeNovo.nome = "";
            $scope.timeNovo.status = "Ativo";
            $scope.timeNovo.descricao = "";
            $scope.timeNovo.recursos = [];
            $scope.timeNovo.tecnologias = [];
            $scope.timeNovo.lider = idusuario;
            $scope.teamNameErro = "";
        };

        $scope.adicionarPessoaRecurso = function (time) {

        };

        $scope.ok = function () {
            $scope.$close(true);
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalViewActivityController',
    function ($scope, projetoSelecionado, indice, Pessoa) {
        $scope.indice = 0;

        $scope.initModalEditActivity = function () {
            $scope.indice = indice;
            $scope.listaTimes = [];
            if(projetoSelecionado.atividades[indice].inicio.$date) {
                projetoSelecionado.atividades[indice].inicio.$date =
                    moment(projetoSelecionado.atividades[indice].inicio.$date).toDate();
                projetoSelecionado.atividades[indice].fim.$date =
                    moment(projetoSelecionado.atividades[indice].fim.$date).toDate();
            }

            if(projetoSelecionado.atividades[indice].designado) {
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
    .controller('ModalNewTeamActivityController',
    function ($scope, $rootScope, $state, timeSelecionado, Pessoa, Atividade) {
        $scope.time = timeSelecionado;
        $scope.showSelectLoading = false;
        $scope.pessoas = [];

        $scope.initModalNewTeamActivity = function () {
            $scope.atividadeNova = new Atividade();
            $scope.atividadeNova.nome = "";
            $scope.atividadeNova.status = "aguardando";
            $scope.atividadeNova.inicio =  {"$date": new Date()};
            $scope.atividadeNova.duracao= 1;
            $scope.atividadeNova.fim =  {"$date": new Date()};
            $scope.atividadeNova.designado = null;
            $scope.atividadeNova.notas = "";
            $scope.atividadeNova.time = timeSelecionado._id.$oid;

            var listaIdPessoa = [];
            for(var i = 0; i < $scope.time.recursos.length; i++) {
                listaIdPessoa.push({"$oid" : $scope.time.recursos[i]});
            }
            var pQuery = {
                "_id": {
                    "$in": listaIdPessoa
                }
            };

            Pessoa.query(pQuery).then(function (pessoas) {
                $scope.pessoas = pessoas;
            });

        };

        $scope.calculaFim = function () {
            if ($scope.atividadeNova.duracao !== 0 && $scope.atividadeNova.inicio.$date) {
                $scope.atividadeNova.fim.$date = moment($scope.atividadeNova.inicio.$date).businessAdd(($scope.atividadeNova.duracao - 1)).toDate();
            } else {
                $scope.atividadeNova.fim.$date = null;
            }
        };

        function novaAtividadeValida() {
            var valido = true;
            $scope.activityNameErro = "";
            $scope.activityInicioErro = "";
            $scope.activityDuracaoErro = "";

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

            return valido;
        }

        $scope.ok = function () {

            if (novaAtividadeValida()) {
                waitingDialog.show('Salvando atividade. Aguarde');

                $scope.atividadeNova.$saveOrUpdate().then(function () {
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
    .controller('ModalEditTeamActivityController',
    function ($scope, $rootScope, $state, timeSelecionado, atividadeSelecionada, Pessoa, Atividade, $uibModal) {
        $scope.time = timeSelecionado;
        $scope.pessoas = [];

        $scope.initModalEditTeamActivity = function () {
            var listaIdPessoa = [];
            for(var i = 0; i < $scope.time.recursos.length; i++) {
                listaIdPessoa.push({"$oid" : $scope.time.recursos[i]});
            }
            var pQuery = {
                "_id": {
                    "$in": listaIdPessoa
                }
            };

            Pessoa.query(pQuery).then(function (pessoas) {
                $scope.pessoas = pessoas;
            });

            if(atividadeSelecionada.inicio.$date) {
                atividadeSelecionada.inicio.$date =
                    moment(atividadeSelecionada.inicio.$date).toDate();
                atividadeSelecionada.fim.$date =
                    moment(atividadeSelecionada.fim.$date).toDate();
            }

            $scope.atividade = atividadeSelecionada;

        };

        $scope.calculaFim = function () {
            if ($scope.atividade.duracao !== 0 && $scope.atividade.inicio.$date) {
                $scope.atividade.fim.$date = moment($scope.atividade.inicio.$date).businessAdd(($scope.atividade.duracao - 1)).toDate();
            } else {
                $scope.atividade.fim.$date = null;
            }
        };

        function novaAtividadeValida() {
            var valido = true;
            $scope.activityNameErro = "";
            $scope.activityInicioErro = "";
            $scope.activityDuracaoErro = "";

            if (!$scope.atividade.nome) {
                $scope.activityNameErro = "O Nome é obrigatório na criação da atividade.";
                valido = false;
            }

            if (!$scope.atividade.inicio.$date) {
                $scope.activityInicioErro = "O Inicio é obrigatório na criação da atividade.";
                valido = false;
            }

            if (!$scope.atividade.duracao || $scope.atividade.duracao === 0) {
                $scope.activityDuracaoErro = "A Duração é obrigatório  e deve ser maior que zero na criação da atividade.";
                valido = false;
            }

            return valido;
        }

        $scope.ok = function () {

            if (novaAtividadeValida()) {
                waitingDialog.show('Salvando atividade. Aguarde');
                delete $scope.atividade.pessoaDesignado;
                delete $scope.atividade.pessoaRecurso;
                $scope.atividade.$saveOrUpdate().then(function () {
                    waitingDialog.hide();
                    $scope.$close(true);
                });
            }
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };

        $scope.deleteTeamActivity = function () {
            if ($scope.atividade) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/delete-team-activity.html',
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
                                return $scope.atividade;
                            }
                        }
                    }).result.then(function () {
                        executeDeleteTeamActivity();
                    }, function () {

                    });
            }
        };

        function executeDeleteTeamActivity () {
            waitingDialog.show('Excluido atividade. Aguarde');
            atividadeSelecionada.$remove().then(function () {
                waitingDialog.hide();
                $scope.$close(true);
            });
        }

    });

angular.module('team-task')
    .controller('ModalViewTeamActivityController',
    function ($scope, atividadeSelecionada, Pessoa) {
        $scope.indice = 0;
        $scope.atividade = {};
        $scope.initModalEditActivity = function () {
            $scope.listaTimes = [];
            if(atividadeSelecionada.inicio.$date) {
                atividadeSelecionada.inicio.$date =
                    moment(atividadeSelecionada.inicio.$date).toDate();
                atividadeSelecionada.fim.$date =
                    moment(atividadeSelecionada.fim.$date).toDate();
            }

            if(atividadeSelecionada.designado) {
                Pessoa.getById(atividadeSelecionada.designado).then(function (designado) {
                    if (designado) {
                        $scope.designado = designado;
                    }
                })
            }
            $scope.atividade = atividadeSelecionada;
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });