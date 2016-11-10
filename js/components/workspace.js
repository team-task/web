angular.module('team-task')
    .controller('WorkspaceProjectsController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$uibModal',
        function ($scope, $rootScope, $state, Projeto, Atividade, Time, DTOptionsBuilder, $resource, $uibModal) {
            $scope.showLoading = false;
            $scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);

            $scope.initWorkspaceProjects = function () {
                loadTable();
            };

            function loadTable() {
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
            $scope.dtAOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);

            function loadTable() {
                $scope.atividades = [];
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
                        for (var i = 0; i < times.length; i++) {
                            listaTimes.push(times[i]._id.$oid);
                        }
                        var aQuery = {
                            "time": {
                                "$in": listaTimes
                            },
                            "status" : ["aguardando", "iniciada"]
                        };
                        Atividade.query(aQuery).then(function (atividades) {
                            $scope.atividades = atividades;
                            angular.forEach($scope.atividades, function (atividade, idAtividade) {
                                var _id = {
                                    "_id" : {
                                        "$oid" : atividade.time
                                    }
                                };
                                var time = $filter('filter')(times, _id);
                                if (time && time.length > 0) {
                                    time = time[0];
                                    time.pessoaLider = {};
                                    time.pessoaRecurso = [];

                                    Pessoa.getById(time.lider).then(function (lider) {

                                        var nomes = lider.nome.split(" ");
                                        var iniciais = nomes[0].substring(0, 1);
                                        var nomeSimples = nomes[0];
                                        if (nomes.length > 1) {
                                            iniciais += nomes[1].substring(0, 1);
                                        }
                                        lider.iniciais = iniciais.toUpperCase();
                                        lider.nomeSimples = nomeSimples;

                                        time.pessoaLider = lider;
                                    });
                                    for (var a = 0; a < time.recursos.length; a++) {

                                        Pessoa.getById(time.recursos[a]).then(function (recurso) {

                                            var nomes = recurso.nome.split(" ");
                                            var iniciais = nomes[0].substring(0, 1);
                                            var nomeSimples = nomes[0];
                                            if (nomes.length > 1) {
                                                iniciais += nomes[1].substring(0, 1);
                                            }
                                            recurso.iniciais = iniciais.toUpperCase();
                                            recurso.nomeSimples = nomeSimples;

                                            time.pessoaRecurso.push(recurso);
                                        });

                                    }
                                    atividade.timeObj = time;
                                }
                            });
                            $scope.showLoading = false;
                        });
                    }
                });
            }

            $scope.initWorkspaceActivities = function () {
                loadTable();
            };
        }]);