angular.module('team-task')
    .controller('WorkspaceProjectsController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$uibModal',
        function ($scope, $rootScope, $state, Projeto, Atividade, Time, DTOptionsBuilder, $resource, $uibModal) {
            $scope.showLoading = false;
            $scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);

            $scope.initWorkspaceProjects = function () {
                loadTable();
            };

            function loadTable () {
                $scope.showLoading = true;
                $scope.listaProjetos = [];
                var idusuario = $rootScope.usuarioLogado._id.$oid;
                var qTime = {
                    "$or": [
                        {"lider": idusuario},
                        {"recursos": idusuario}
                    ]
                };
                Time.query(qTime).then(function (times) {

                    if (times[0]) {
                        var listaTimes = [];
                        for (var i = 0; i < times.length; i++) {
                            listaTimes.push(times[i]._id.$oid);
                        }
                        var pQuery = {
                            "$or": [
                                {"administrador": idusuario}
                                , {"time": {"$in": listaTimes}}]
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
    .controller('WorkspaceActivitiesController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$filter', 'Pessoa',
        function ($scope, $rootScope, $state, Atividade, Time, DTOptionsBuilder, $resource, $filter, Pessoa) {
            $scope.showLoading = false;

            if (!$scope.dtAOptions) {
                $scope.dtAOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);
            }

            $scope.initWorkspaceActivities = function () {

                $scope.showLoading = true;
                var idusuario = $rootScope.usuarioLogado._id.$oid;
                var qTime = {
                    "$or": [
                        {"lider": idusuario},
                        {"recursos": idusuario}
                    ]
                };
                Time.query(qTime).then(function (times) {

                    if (times[0]) {
                        var listaTimes = [];
                        var admins = [];
                        var recursos = [];
                        for (var i = 0; i < times.length; i++) {
                            listaTimes.push(times[i]._id.$oid);
                            //lider
                            var adminFound = $filter('filter')(admins, {'_id': {'$oid': times[i].lider}});
                            if (!adminFound || adminFound.length == 0) {
                                Pessoa.getById(times[i].lider).then(function (lider) {

                                    var nomes = lider.nome.split(" ");
                                    var iniciais = nomes[0].substring(0, 1);
                                    var nomeSimples = nomes[0];
                                    if (nomes.length > 1) {
                                        iniciais += nomes[1].substring(0, 1);
                                    }
                                    lider.iniciais = iniciais.toUpperCase();
                                    lider.nomeSimples = nomeSimples;

                                    admins.push(lider);
                                });
                            }
                            //recursos
                            for (var a = 0; a < times[i].recursos.length; a++) {
                                var recursoFound = $filter('filter')(recursos, {'_id': {'$oid': times[i].recursos[a]}});
                                if (!recursoFound || recursoFound.length == 0) {
                                    Pessoa.getById(times[i].recursos[a]).then(function (recurso) {

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
                            "time": {
                                "$in": listaTimes
                            }
                        };
                        Atividade.query(aQuery).then(function (atividades) {
                            $scope.atividades = atividades;
                            angular.forEach(times, function (time, idTime) {
                                time.atividades = $filter('filter')(atividades, {'time': time._id.$oid});
                                //obj lider
                                var lidersFilter = $filter('filter')(admins, {'_id': {'$oid': time.lider}});
                                if (lidersFilter.length > 0) {
                                    time.pessoaLider = lidersFilter[0];
                                }
                                //obj recursos
                                time.pessoaRecurso = [];
                                for (var z = 0; z < time.recursos.length; z++) {
                                    var recursosFilter = $filter('filter')(recursos, {'_id': {'$oid': time.recursos[z]}});
                                    if (recursosFilter.length > 0) {
                                        time.pessoaRecurso.push(recursosFilter[0]);
                                    }
                                }
                            });
                            $scope.times = times;
                            $scope.showLoading = false;
                        });
                    }
                });
            };
        }]);