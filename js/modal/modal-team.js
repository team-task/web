angular.module('team-task')
    .controller('ModalEditTeamController',
    function ($scope, timeEdicao, Pessoa, $uibModal, $filter) {
        $scope.recursosPessoas = [];
        $scope.initModalEditTeam = function () {
            $scope.timeEdicao = timeEdicao;

            var arrayOids = [];
            for (var i = 0; i < timeEdicao.recursos.length; i++) {
                arrayOids.push({"$oid": timeEdicao.recursos[i]});
            }
            var pQuery = {
                "_id": {
                    "$in": arrayOids
                }
            };
            Pessoa.query(pQuery).then(function (pessoas) {
                $scope.recursosPessoas = pessoas;
            });

        };

        $scope.adicionarPessoaRecurso = function (time) {
            $uibModal
                .open({
                    templateUrl: 'views/modal/add-people.html',
                    controller: function ($scope, parentScope, Pessoa) {
                        var lista = [];
                        $scope.selecionados = [];

                        for (var i = 0; i < parentScope.timeEdicao.recursos.length; i++) {
                            lista.push({"$oid": parentScope.timeEdicao.recursos[i]});
                        }
                        var pQuery = {
                            "_id": {
                                "$nin": lista
                            }
                        };
                        Pessoa.query(pQuery).then(function (pessoas) {
                            $scope.pessoasSelecao = pessoas;
                        });
                        $scope.ok = function () {

                            parentScope.recursosPessoas = parentScope.recursosPessoas.concat($scope.selecionados);
                            for (var a = 0; a < $scope.selecionados.length; a++) {
                                parentScope.timeEdicao.recursos.push($scope.selecionados[a]._id.$oid);
                            }
                            $scope.$close(true);
                        };
                        $scope.cancel = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        }
                    }
                }).result.then(function () {
                }, function () {
                });
        };

        $scope.removePessoa = function (pessoa) {
            $scope.timeEdicao.recursos = $filter('removeWith')($scope.timeEdicao.recursos, pessoa._id.$oid);
            $scope.recursosPessoas = $filter('removeWith')($scope.recursosPessoas, pessoa);
        };

        $scope.removeTecnologia = function (tecnologia) {
            $scope.timeEdicao.tecnologias = $filter('removeWith')($scope.timeEdicao.tecnologias, tecnologia);
        };

        $scope.adicionarTecnologia = function () {
            if ($scope.tecnologia) {
                $scope.timeEdicao.tecnologias.push($scope.tecnologia);
                $scope.tecnologia = "";
            }
        };

        $scope.deleteTeam = function () {
            $uibModal
                .open({
                    templateUrl: 'views/modal/delete-team.html',
                    controller: function ($scope, timeExclusao, Atividade, Projeto, $q) {
                        $scope.time = {};
                        $scope.deleteDeny = true;
                        $scope.initModalDeleteTeam = function () {
                            $scope.time = timeExclusao;
                            var promisses = [];
                            //verificar se o time tem atividades ou projetos associados.
                            var aQuery = {"time": timeExclusao._id.$oid};
                            var pQuery = {"atividades.time": timeExclusao._id.$oid};
                            var qtdTotal = 0;
                            promisses.push(Atividade.query(aQuery).then(function (atividade) {
                                if (atividade.length > 0) {
                                    qtdTotal++;
                                }
                            }));
                            promisses.push(Projeto.query(pQuery).then(function (projeto) {
                                if (projeto.length > 0) {
                                    qtdTotal++;
                                }
                            }));
                            $q.all(promisses).then(function () {
                                $scope.deleteDeny = qtdTotal > 0;
                                $scope.qtdAtividades = qtdTotal;
                            });
                        };

                        $scope.ok = function () {
                            $scope.$close(true);
                        };
                        $scope.cancel = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        timeExclusao: function () {
                            return $scope.timeEdicao;
                        }
                    }
                }).result.then(function () {
                    executeDeleteTeam();
                }, function () {

                });
        };

        function executeDeleteTeam () {
            $scope.timeEdicao.$remove().then(function () {
                $scope.$close(true);
            });
        }

        $scope.ok = function () {

            if ($scope.timeEdicao.nome) {
                $scope.timeEdicao.$saveOrUpdate().then(function () {
                    $scope.$close(true);
                });
            } else {
                $scope.teamNameErro = "O nome do Time é obrigatório";
            }
        };

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalViewTeamController',
    function ($scope, timeSelecionado, Pessoa) {
        $scope.recursosPessoas = [];
        $scope.initModalViewTeam = function () {
            $scope.timeView = timeSelecionado;
            var arrayOids = [];
            for (var i = 0; i < timeSelecionado.recursos.length; i++) {
                arrayOids.push({"$oid": timeSelecionado.recursos[i]});
            }
            var pQuery = {
                "_id": {
                    "$in": arrayOids
                }
            };
            Pessoa.query(pQuery).then(function (pessoas) {
                $scope.recursosPessoas = pessoas;
            });
        };

        $scope.fechar = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalNewTeamController',
    function ($scope, $rootScope, $uibModal, Time, $filter) {
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
            $scope.tecnologia = "";
        };

        $scope.cancelNewTeam = function () {
            $scope.$dismiss();
        };

        $scope.adicionarPessoaRecurso = function (time) {
            $uibModal
                .open({
                    templateUrl: 'views/modal/add-people.html',
                    controller: function ($scope, parentScope, Pessoa) {
                        var lista = [];
                        $scope.selecionados = [];

                        for (var i = 0; i < parentScope.timeNovo.recursos.length; i++) {
                            lista.push({"$oid": parentScope.timeNovo.recursos[i]});
                        }
                        var pQuery = {
                            "_id": {
                                "$nin": lista
                            }
                        };
                        Pessoa.query(pQuery).then(function (pessoas) {
                            $scope.pessoasSelecao = pessoas;
                        });
                        $scope.ok = function () {

                            parentScope.recursosPessoas = parentScope.recursosPessoas.concat($scope.selecionados);
                            for (var a = 0; a < $scope.selecionados.length; a++) {
                                parentScope.timeNovo.recursos.push($scope.selecionados[a]._id.$oid);
                            }
                            $scope.$close(true);
                        };
                        $scope.cancel = function () {
                            $scope.$dismiss();
                        };
                    },
                    resolve: {
                        parentScope: function () {
                            return $scope;
                        }
                    }
                }).result.then(function () {
                }, function () {
                });
        };

        $scope.removePessoa = function (pessoa) {
            $scope.timeNovo.recursos = $filter('removeWith')($scope.timeNovo.recursos, pessoa._id.$oid);
            $scope.recursosPessoas = $filter('removeWith')($scope.recursosPessoas, pessoa);
        };

        $scope.removeTecnologia = function (tecnologia) {
            $scope.timeNovo.tecnologias = $filter('removeWith')($scope.timeNovo.tecnologias, tecnologia);
        };

        $scope.adicionarTecnologia = function () {
            if ($scope.tecnologia) {
                $scope.timeNovo.tecnologias.push($scope.tecnologia);
                $scope.tecnologia = "";
            }
        };

        $scope.confirmCreate = function () {

            if ($scope.timeNovo.nome) {
                $scope.timeNovo.$saveOrUpdate().then(function () {
                    $scope.$close(true);
                });
            } else {
                $scope.teamNameErro = "O nome do Time é obrigatório";
            }
        };
    });