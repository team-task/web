angular.module('team-task')
    .controller('ModalMyProfileController',
    function ($scope, $rootScope, $window, Pessoa) {
        $scope.nameErro = "";
        $scope.usuarioErro = "";
        $scope.novasenhaErro = "";
        $scope.senhaanteriorErro = "";
        $scope.novasenha = "";
        $scope.senhaanterior = "";
        $scope.initModalMyProfile = function () {
            if($rootScope.usuarioLogado) {
                $scope.pessoa = {
                    "nome": $rootScope.usuarioLogado.nome,
                    "usuario": $rootScope.usuarioLogado.usuario
                };
            }
        };

        $scope.ok = function () {
            if(validaProfile()) {
                waitingDialog.show("Salvando novas informações. Aguarde.");
                Pessoa.getById($rootScope.usuarioLogado._id.$oid).then(
                    function (usuario) {
                        $rootScope.usuarioLogado.nome = $scope.pessoa.nome;
                        $rootScope.usuarioLogado.usuario = $scope.pessoa.usuario;
                        if($scope.novasenha) {
                            $rootScope.usuarioLogado.senha = $scope.novasenha;
                            usuario.senha = $scope.novasenha;
                        }
                        usuario.nome = $scope.pessoa.nome;
                        usuario.usuario = $scope.pessoa.usuario;

                        usuario.$saveOrUpdate().then(function () {
                            var nomes = $rootScope.usuarioLogado.nome.split(" ");
                            var iniciais = nomes[0].substring(0, 1);
                            var nomeSimples = nomes[0];
                            if (nomes.length > 1) {
                                iniciais += nomes[1].substring(0, 1);
                            }
                            $rootScope.usuarioLogado.iniciais = iniciais.toUpperCase();
                            $rootScope.usuarioLogado.nomeSimples = nomeSimples;
                            $window.sessionStorage.setItem('usuarioLogado', angular.toJson($rootScope.usuarioLogado));
                            waitingDialog.hide();
                            $scope.$close(true);
                        });
                    }
                );
            }
        };

        function validaProfile () {
            var valido = true;
            $scope.nameErro = "";
            $scope.usuarioErro = "";
            $scope.novasenhaErro = "";
            $scope.senhaanteriorErro = "";

            if(!$scope.pessoa.nome) {
                $scope.nameErro = "O Nome é obrigatório.";
                valido = false;
            }
            if(!$scope.pessoa.usuario) {
                $scope.usuarioErro = "O Login do Usuário é obrigatório.";
                valido = false;
            }

            if($scope.novasenha) {
                //quer mudar a senha
                if($scope.novasenha.length < 4) {
                    $scope.novasenhaErro = "A nova senha deve ter pelo menos 4 caracteres.";
                    valido = false;
                }
                if(!$scope.senhaanterior) {
                    $scope.senhaanteriorErro = "Para alterar a senha, uma nova é obrigatória.";
                    valido = false;
                } else {
                    if($scope.senhaanterior === $scope.novasenha) {
                        $scope.senhaanteriorErro = "As senhas tem que ser diferentes.";
                        valido = false;
                    }
                    if($scope.senhaanterior !== $rootScope.usuarioLogado.senha) {
                        $scope.senhaanteriorErro = "Senha anterior não confere.";
                        valido = false;
                    }
                }
            }
            return valido;
        }

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });
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
    .controller('ModalNewActivityController',
    function ($scope, $rootScope, projetoSelecionado, $state, Time, Pessoa) {

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
                "time": ""
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
    .controller('ModalEditActivityController',
    function ($scope, $rootScope, projetoSelecionado, indice, $state, Time, Pessoa, $uibModal, $filter) {
        $scope.projeto = {};
        $scope.indice = 0;
        $scope.listaRecursos = [];
        $scope.showSelectLoading = false;

        $scope.initModalEditActivity = function () {
            $scope.indice = indice;
            $scope.listaTimes = [];
            if (projetoSelecionado.atividades[indice].inicio.$date) {
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
                    //if (projetoSelecionado.atividades[indice].designado) {
                        $scope.carregaPessoas();
                    //}
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


            var idusuario = $rootScope.usuarioLogado._id.$oid;
            var qTime = {"lider": idusuario};
            Time.query(qTime).then(function (times) {
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

            var listaIdPessoa = [];
            for (var i = 0; i < $scope.time.recursos.length; i++) {
                listaIdPessoa.push({"$oid": $scope.time.recursos[i]});
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
            for (var i = 0; i < $scope.time.recursos.length; i++) {
                listaIdPessoa.push({"$oid": $scope.time.recursos[i]});
            }
            var pQuery = {
                "_id": {
                    "$in": listaIdPessoa
                }
            };

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