angular.module('team-task')
    .controller('ConfigPeopleController',
        ['$scope', '$rootScope', '$state', 'Time', '$uibModal', '$stateParams', 'Pessoa',
        function ($scope, $rootScope, $state, Time, $uibModal, $stateParams, Pessoa) {
            $scope.showLoading = false;

            function loadTable () {
                $scope.showLoading = true;
                if($rootScope.usuarioLogado) {
                    var idusuario = $rootScope.usuarioLogado._id.$oid;
                    var qPessoa = {
                        "cadastrado": idusuario
                    };
                    Pessoa.query(qPessoa, {"sort": {"nome": 1}, "fields": {"senha": 0}}).then(function (pessoas) {
                        for(var i = 0; i < pessoas.length; i++) {
                            var nomes = pessoas[i].nome.split(" ");
                            var iniciais = nomes[0].substring(0, 1);
                            var nomeSimples = nomes[0];
                            if (nomes.length > 1) {
                                iniciais += nomes[1].substring(0, 1);
                            }
                            pessoas[i].iniciais = iniciais.toUpperCase();
                            pessoas[i].nomeSimples = nomeSimples;
                        }
                        $scope.listagemPessoas = pessoas;
                        $scope.showLoading = false;
                    });
                }
            }


            $scope.initConfigPeople = function () {
                loadTable();
            };

            $scope.mostrarDetalhePessoa = function (pessoa) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-people.html',
                        controller: 'ModalViewPeopleController',
                        resolve: {
                            pessoaSelecionada: function () {
                                return pessoa;
                            }
                        }
                    }).result.then(function () {}, function () {});
            };

            $scope.novaPessoa = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-people.html',
                        controller: 'ModalNewPeopleController'
                    }).result.then(function () {
                        loadTable();
                    }, function () {
                    });
            };

            $scope.editarPessoa = function (pessoa) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-people.html',
                        controller: 'ModalEditPeopleController',
                        resolve: {
                            pessoaEdicao: function () {
                                return pessoa;
                            }
                        }
                    }).result.then(function () {
                        loadTable();
                    }, function () {
                    });
            };
        }]);

angular.module('team-task')
    .controller('ModalViewPeopleController',
    function ($scope, pessoaSelecionada, Time) {
        $scope.listaTimesPessoa = [];
        $scope.initModalViewPeople = function () {
            $scope.pessoaView = pessoaSelecionada;
            var tquery = {
                "recursos": pessoaSelecionada._id.$oid
            };
            Time.query(tquery, {"sort": {"nome": 1}}).then(function (times) {
                $scope.listaTimesPessoa = times;
            });
        };

        $scope.fechar = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalEditPeopleController',
    function ($scope, pessoaEdicao, Time, Pessoa, $filter, $uibModal, $q, Atividade, Projeto) {
        $scope.listaTimesPessoa = [];
        $scope.initModalEditPeople = function () {
            $scope.pessoaEdit = pessoaEdicao;
            var tquery = {
                "recursos": pessoaEdicao._id.$oid
            };
            Time.query(tquery, {"sort": {"nome": 1}}).then(function (times) {
                $scope.listaTimesPessoa = times;
            });
        };

        $scope.removeTecnologia = function (tecnologia) {
            $scope.pessoaEdit.tecnologias = $filter('removeWith')($scope.pessoaEdit.tecnologias, tecnologia);
        };

        $scope.adicionarTecnologia = function () {
            if ($scope.tecnologia) {
                if(!$scope.pessoaEdit.tecnologias) {
                    $scope.pessoaEdit.tecnologias = [];
                }
                $scope.pessoaEdit.tecnologias.push($scope.tecnologia);
                $scope.tecnologia = "";
            }
        };

        $scope.removeTecnologia = function (tecnologia) {
            $scope.pessoaEdit.tecnologias = $filter('removeWith')($scope.pessoaEdit.tecnologias, tecnologia);
        };

        $scope.deletePeople = function () {
            $uibModal
                .open({
                    templateUrl: 'views/modal/delete-people.html',
                    controller: function ($scope, pessoaExclusao, Atividade, Projeto, $q) {
                        $scope.pessoaDelete = {};
                        $scope.deleteDeny = true;
                        $scope.initModalDeletePeople = function () {
                            $scope.pessoaDelete = pessoaExclusao;
                            var promisses = [];
                            //verificar se o time tem atividades ou projetos associados.
                            var aQuery = {"designado": $scope.pessoaDelete._id.$oid};
                            var pQuery = {"atividades.designado": $scope.pessoaDelete._id.$oid};
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
                        pessoaExclusao: function () {
                            return $scope.pessoaEdit;
                        }
                    }
                }).result.then(function () {

                }, function () {

                });
        };

        function validaPessoa () {
            $scope.nomeErro = "";
            $scope.usuarioErro = "";
            var valido = true;
            if(!$scope.pessoaEdit.nome) {
                $scope.nomeErro = "O nome é obrigatório na criação do usuário";
                valido = false;
            }
            if(!$scope.pessoaEdit.usuario) {
                $scope.usuarioErro = "O login é obrigatório na criação do usuário";
                valido = false;
            }
            return valido;
        }

        $scope.ok = function () {
            if(validaPessoa()) {

                Pessoa.getById(pessoaEdicao._id.$oid).then(function (pessoaDB) {
                    pessoaEdicao.senha = pessoaDB.senha;
                    //verificar se mudou se o usuario estava ativo e foi inativado.
                    if(!pessoaEdicao.ativo && pessoaEdicao.ativo !== pessoaDB.ativo) {
                        var promisses = [];
                        //verificar se o time tem atividades ou projetos associados.
                        var aQuery = {"designado": pessoaEdicao._id.$oid};
                        var pQuery = {"atividades.designado": pessoaEdicao._id.$oid};
                        var atividadesUsuario = [];
                        var projetosUsuario = [];
                        var totais = 0;
                        promisses.push(Atividade.query(aQuery).then(function (atividade) {
                            if (atividade.length > 0) {
                                atividadesUsuario.push(atividade)
                            }
                        }));
                        promisses.push(Projeto.query(pQuery).then(function (projeto) {
                            if (projeto.length > 0) {
                                projetosUsuario.push(projeto);
                            }
                        }));
                        $q.all(promisses).then(function () {
                            totais = atividadesUsuario.length + projetosUsuario.length;
                            //verifica se tem esse usuario em atividades.
                            if(totais > 0) {
                                $uibModal
                                    .open({
                                        templateUrl: 'views/modal/inactive-people.html',
                                        controller: function ($scope, pessoaDesativacao, qtdAtividades) {
                                            $scope.pessoaInactive = {};
                                            $scope.initModalDeletePeople = function () {
                                                $scope.pessoaInactive = pessoaDesativacao;
                                                $scope.qtdAtividades = qtdAtividades;
                                            };

                                            $scope.ok = function () {
                                                $scope.$close(true);
                                            };
                                            $scope.cancel = function () {
                                                $scope.$dismiss();
                                            };
                                        },
                                        resolve: {
                                            pessoaDesativacao: function () {
                                                return pessoaEdicao;
                                            },
                                            qtdAtividades: function () {
                                                return totais;
                                            }
                                        }
                                    }).result.then(function () {
                                        //desativar e retirar ele de tudo.
                                        var desativarProm = [];
                                        if (atividadesUsuario.length > 0) {
                                            for(var at = 0; at < atividadesUsuario.length; at++) {
                                                atividadesUsuario[at].designado = null;
                                                desativarProm.push(atividadesUsuario[at].$saveOrUpdate().then(function () {}));
                                            }
                                        }
                                        if (projetosUsuario.length > 0) {
                                            for(var pu = 0; pu < projetosUsuario.length; pu++) {
                                                for(var ap = 0; ap < projetosUsuario[pu].atividades.length; ap++) {
                                                    if(projetosUsuario[pu].atividades[ap].designado === pessoaEdicao._id.$oid) {
                                                        projetosUsuario[pu].atividades[ap].designado = null;
                                                        desativarProm.push(projetosUsuario[pu].$saveOrUpdate().then(function () {}));
                                                    }
                                                }
                                            }
                                        }
                                        $q.all(desativarProm).then(function () {
                                            salvarUsuario(pessoaEdicao);
                                        });
                                    }, function () {

                                    });
                            }
                        });
                    } else {
                        //esta tudo bem.
                        salvarUsuario(pessoaEdicao);
                    }
                });
            }
        };

        function salvarUsuario (pessoaEdicao) {
            pessoaEdicao.$saveOrUpdate().then(function () {
                $scope.$close(true);
            });
        }

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });

angular.module('team-task')
    .controller('ModalNewPeopleController',
    function ($scope, Time, Pessoa, $filter, $rootScope) {
        $scope.nomeErro = "";
        $scope.usuarioErro = "";
        $scope.initModalNewPeople = function () {
            $scope.nomeErro = "";
            $scope.usuarioErro = "";
            $scope.pessoaNew = new Pessoa();
            $scope.pessoaNew.nome = "";
            $scope.pessoaNew.usuario = "";
            $scope.pessoaNew.senha = "team";
            $scope.pessoaNew.cadastrado = $rootScope.usuarioLogado._id.$oid;
            $scope.pessoaNew.ativo = true;
            $scope.pessoaNew.tecnologias = [];
        };

        $scope.removeTecnologia = function (tecnologia) {
            $scope.pessoaNew.tecnologias = $filter('removeWith')($scope.pessoaNew.tecnologias, tecnologia);
        };

        $scope.adicionarTecnologia = function () {
            if ($scope.tecnologia) {
                if(!$scope.pessoaNew.tecnologias) {
                    $scope.pessoaNew.tecnologias = [];
                }
                $scope.pessoaNew.tecnologias.push($scope.tecnologia);
                $scope.tecnologia = "";
            }
        };

        $scope.removeTecnologia = function (tecnologia) {
            $scope.pessoaNew.tecnologias = $filter('removeWith')($scope.pessoaNew.tecnologias, tecnologia);
        };

        $scope.ok = function () {
            if(validaPessoa()) {
                $scope.pessoaNew.$saveOrUpdate().then(function () {
                    $scope.$close(true);
                });
            }
        };

        function validaPessoa () {
            $scope.nomeErro = "";
            $scope.usuarioErro = "";
            var valido = true;
            if(!$scope.pessoaNew.nome) {
                $scope.nomeErro = "O nome é obrigatório na criação do usuário";
                valido = false;
            }
            if(!$scope.pessoaNew.usuario) {
                $scope.usuarioErro = "O login é obrigatório na criação do usuário";
                valido = false;
            }
            return valido;
        }

        $scope.cancel = function () {
            $scope.$dismiss();
        };
    });