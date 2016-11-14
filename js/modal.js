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

                if($scope.atividadeNova.designado) {
                    $scope.atividadeNova.designado = $scope.atividadeNova.designado._id.$oid;
                }
                projetoSelecionado.duracao = Math.floor(moment(projetoSelecionado.fim.$date).businessDiff(moment(projetoSelecionado.inicio.$date), 'days')) + 1;

                projetoSelecionado.$saveOrUpdate().then(function () {
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
    function ($scope, $rootScope, projetoSelecionado, indice, $state, Time, Pessoa) {
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

                if($scope.projeto.atividades[$scope.indice].designado) {
                    $scope.projeto.atividades[$scope.indice].designado = $scope.projeto.atividades[$scope.indice].designado._id.$oid;
                }
                projetoSelecionado.duracao = Math.floor(moment(projetoSelecionado.fim.$date).businessDiff(moment(projetoSelecionado.inicio.$date), 'days')) + 1;

                projetoSelecionado.$saveOrUpdate().then(function () {
                    $scope.$close(true);
                });
            }
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });
