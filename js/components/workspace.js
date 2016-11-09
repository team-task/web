angular.module('team-task')
    .controller('WorkspaceProjectsController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Grupo',
        'DTOptionsBuilder', '$resource', '$uibModal',
        function ($scope, $rootScope, $state, Projeto, Atividade, Grupo, DTOptionsBuilder, $resource, $uibModal) {
            $scope.showLoading = false;
            $scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);

            $scope.initWorkspaceProjects = function () {
                loadTable();
            };

            function loadTable () {
                $scope.showLoading = true;
                $scope.listaProjetos = [];
                var idusuario = $rootScope.usuarioLogado._id.$oid;
                var qGrupo = {
                    "$or": [
                        {"gerente": idusuario},
                        {"recursos": idusuario}
                    ]
                };
                Grupo.query(qGrupo).then(function (grupos) {

                    if (grupos[0]) {
                        var listaGrupos = [];
                        for (var i = 0; i < grupos.length; i++) {
                            listaGrupos.push(grupos[i]._id.$oid);
                        }
                        var pQuery = {
                            "$or": [
                                {"administrador": idusuario}
                                , {"grupo": {"$in": listaGrupos}}]
                        };
                        Projeto.query(pQuery).then(function (projetos) {
                            $scope.listaProjetos = projetos;
                            $scope.showLoading = false;
                        });
                    }
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
                    }).result.then(function () {
                        loadTable();
                    }, function () {
                    });
            };

            $scope.novoProjeto = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-project.html',
                        controller: 'ModalNewProjectController'
                    }).result.then(function () {
                        loadTable();
                    }, function () {
                    });
            }
        }]);

angular.module('team-task')
    .controller('WorkspaceActivitiesController', ['$scope', '$rootScope', '$state', 'Atividade', 'Grupo',
        'DTOptionsBuilder', '$resource', '$filter', 'Pessoa',
        function ($scope, $rootScope, $state, Atividade, Grupo, DTOptionsBuilder, $resource, $filter, Pessoa) {
            $scope.showLoading = false;

            if (!$scope.dtAOptions) {
                $scope.dtAOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);
            }

            $scope.initWorkspaceActivities = function () {

                $scope.showLoading = true;
                var idusuario = $rootScope.usuarioLogado._id.$oid;
                var qGrupo = {
                    "$or": [
                        {"gerente": idusuario},
                        {"recursos": idusuario}
                    ]
                };
                Grupo.query(qGrupo).then(function (grupos) {

                    if (grupos[0]) {
                        var listaGrupos = [];
                        var admins = [];
                        var recursos = [];
                        for (var i = 0; i < grupos.length; i++) {
                            listaGrupos.push(grupos[i]._id.$oid);
                            //gerente
                            var adminFound = $filter('filter')(admins, {'_id': {'$oid': grupos[i].gerente}});
                            if (!adminFound || adminFound.length == 0) {
                                Pessoa.getById(grupos[i].gerente).then(function (gerente) {

                                    var nomes = gerente.nome.split(" ");
                                    var iniciais = nomes[0].substring(0, 1);
                                    var nomeSimples = nomes[0];
                                    if (nomes.length > 1) {
                                        iniciais += nomes[1].substring(0, 1);
                                    }
                                    gerente.iniciais = iniciais.toUpperCase();
                                    gerente.nomeSimples = nomeSimples;

                                    admins.push(gerente);
                                });
                            }
                            //recursos
                            for (var a = 0; a < grupos[i].recursos.length; a++) {
                                var recursoFound = $filter('filter')(recursos, {'_id': {'$oid': grupos[i].recursos[a]}});
                                if (!recursoFound || recursoFound.length == 0) {
                                    Pessoa.getById(grupos[i].recursos[a]).then(function (recurso) {

                                        var nomes = recurso.nome.split(" ");
                                        var iniciais = nomes[0].substring(0, 1);
                                        var nomeSimples = nomes[0];
                                        if (nomes.length > 1) {
                                            iniciais += nomes[1].substring(0, 1);
                                        }
                                        recurso.iniciais = iniciais.toUpperCase();
                                        recurso.nomeSimples = nomeSimples;

                                        recursos.push(recurso);
                                    });
                                }
                            }
                        }
                        var aQuery = {
                            "grupo": {
                                "$in": listaGrupos
                            }
                        };
                        Atividade.query(aQuery).then(function (atividades) {
                            $scope.atividades = atividades;
                            angular.forEach(grupos, function (grupo, idGrupo) {
                                grupo.atividades = $filter('filter')(atividades, {'grupo': grupo._id.$oid});
                                //obj gerente
                                var gerentesFilter = $filter('filter')(admins, {'_id': {'$oid': grupo.gerente}});
                                if (gerentesFilter.length > 0) {
                                    grupo.pessoaGerente = gerentesFilter[0];
                                }
                                //obj recursos
                                grupo.pessoaRecurso = [];
                                for (var z = 0; z < grupo.recursos.length; z++) {
                                    var recursosFilter = $filter('filter')(recursos, {'_id': {'$oid': grupo.recursos[z]}});
                                    if (recursosFilter.length > 0) {
                                        grupo.pessoaRecurso.push(recursosFilter[0]);
                                    }
                                }
                            });
                            $scope.grupos = grupos;
                            $scope.showLoading = false;
                        });
                    }
                });
            };
        }]);