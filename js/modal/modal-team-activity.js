angular.module('team-task')
    .controller('ModalNewTeamsActivityController',
    function ($scope, $rootScope, $state, Pessoa, Atividade, Time) {

        $scope.showSelectLoading = false;
        $scope.listaRecursos = [];
        $scope.listaTimes = [];

        $scope.initModalNewTeamsActivity = function () {
            $scope.atividadeNova = new Atividade();
            $scope.atividadeNova.nome = "";
            $scope.atividadeNova.status = "aguardando";
            $scope.atividadeNova.inicio = {"$date": new Date()};
            $scope.atividadeNova.duracao = 1;
            $scope.atividadeNova.fim = {"$date": new Date()};
            $scope.atividadeNova.designado = null;
            $scope.atividadeNova.notas = "";
            $scope.atividadeNova.time = null;
            $scope.atividadeNova.progresso = 0;

            var idusuario = $rootScope.usuarioLogado._id.$oid;
            var qTime = {
                "$or": [
                    {"lider": idusuario},
                    {"recursos": idusuario}
                ]
            };
            Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {
                if (times[0]) {
                    $scope.listaTimes = times;
                }
            });

        };

        $scope.carregaPessoas = function () {
            $scope.listaRecursos = [];
            $scope.showSelectLoading = true;
            if ($scope.atividadeNova.time) {
                Time.getById($scope.atividadeNova.time).then(function (time) {
                    var pQuery;
                    if (time) {
                        if (time.lider === $rootScope.usuarioLogado._id.$oid) {
                            var arrayOids = [];
                            for (var i = 0; i < time.recursos.length; i++) {
                                arrayOids.push({"$oid": time.recursos[i]});
                            }
                            pQuery = {
                                "_id": {
                                    "$in": arrayOids
                                }
                            };
                        } else {
                           pQuery = {
                               "_id" : {
                                   "$oid": $rootScope.usuarioLogado._id.$oid
                               }
                           }
                        }
                        Pessoa.query(pQuery).then(function (pessoas) {
                            if (pessoas[0]) {
                                $scope.listaRecursos = pessoas;
                                $scope.showSelectLoading = false;
                            }
                        });
                    } else {
                        $scope.showSelectLoading = false;
                    }
                });
            } else {
                $scope.showSelectLoading = false;
            }
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
                $scope.activityTimeErro = "O Time é obrigatório na criação da atividade.";
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
    .controller('ModalNewTeamActivityController',
    function ($scope, $rootScope, $state, timeSelecionado, Pessoa, Atividade) {
        $scope.time = timeSelecionado;
        $scope.showSelectLoading = false;
        $scope.pessoas = [];

        $scope.initModalNewTeamActivity = function () {
            $scope.atividadeNova = new Atividade();
            $scope.atividadeNova.nome = "";
            $scope.atividadeNova.status = "aguardando";
            $scope.atividadeNova.inicio = {"$date": new Date()};
            $scope.atividadeNova.duracao = 1;
            $scope.atividadeNova.fim = {"$date": new Date()};
            $scope.atividadeNova.designado = null;
            $scope.atividadeNova.notas = "";
            $scope.atividadeNova.time = timeSelecionado._id.$oid;
            $scope.atividadeNova.progresso = 0;

            var pQuery;
            if (timeSelecionado.lider === $rootScope.usuarioLogado._id.$oid) {
                var listaIdPessoa = [];
                for (var i = 0; i < $scope.time.recursos.length; i++) {
                    listaIdPessoa.push({"$oid": $scope.time.recursos[i]});
                }
                pQuery = {
                    "_id": {
                        "$in": listaIdPessoa
                    }
                };
            } else {
                pQuery = {
                    "_id" : {
                        "$oid": $rootScope.usuarioLogado._id.$oid
                    }
                }
            }

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

            var pQuery;
            if (timeSelecionado.lider === $rootScope.usuarioLogado._id.$oid) {
                var listaIdPessoa = [];
                for (var i = 0; i < $scope.time.recursos.length; i++) {
                    listaIdPessoa.push({"$oid": $scope.time.recursos[i]});
                }
                pQuery = {
                    "_id": {
                        "$in": listaIdPessoa
                    }
                };
            } else {
                pQuery = {
                    "_id" : {
                        "$oid": $rootScope.usuarioLogado._id.$oid
                    }
                }
            }

            Pessoa.query(pQuery).then(function (pessoas) {
                $scope.pessoas = pessoas;
            });

            if (atividadeSelecionada.inicio.$date) {
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
                if($scope.atividade.status === "concluída") {
                    $scope.atividade.progresso = 100;
                }
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

        function executeDeleteTeamActivity() {
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
            if (atividadeSelecionada.inicio.$date) {
                atividadeSelecionada.inicio.$date =
                    moment(atividadeSelecionada.inicio.$date).toDate();
                atividadeSelecionada.fim.$date =
                    moment(atividadeSelecionada.fim.$date).toDate();
            }

            if (atividadeSelecionada.designado) {
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