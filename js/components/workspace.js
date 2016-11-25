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
                if($rootScope.usuarioLogado) {
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
                                    , {"atividades.designado": idusuario}]
                            };
                            Projeto.query(pQuery).then(function (projetos) {
                                $scope.listaProjetos = projetos;
                                $scope.showLoading = false;
                            });
                        }
                    });
                }
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
                        $rootScope.$emit("CallLoadMenus", {});
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
                        $rootScope.$emit("CallLoadMenus", {});
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
            $scope.dtAOptions.withOption('responsive', true);
            $scope.dtAOptions.withOption('order', [[2,"asc"]]);

            function loadTable() {
                $scope.listaAtividades = [];
                $scope.showLoading = true;
                if($rootScope.usuarioLogado) {
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
                                "status": {
                                    "$in": ["aguardando", "iniciada"]
                                }
                            };
                            Atividade.query(aQuery).then(function (atividades) {
                                angular.forEach(atividades, function (atividade, idAtividade) {
                                    var _id = {
                                        "_id": {
                                            "$oid": atividade.time
                                        }
                                    };
                                    var time = $filter('filter')(times, _id);
                                    if (time && time.length > 0) {
                                        time = time[0];
                                        atividade.pessoaLider = {};
                                        atividade.pessoaRecurso = {};
                                        Pessoa.getById(time.lider).then(function (lider) {

                                            var nomes = lider.nome.split(" ");
                                            var iniciais = nomes[0].substring(0, 1);
                                            var nomeSimples = nomes[0];
                                            if (nomes.length > 1) {
                                                iniciais += nomes[1].substring(0, 1);
                                            }
                                            lider.iniciais = iniciais.toUpperCase();
                                            lider.nomeSimples = nomeSimples;
                                            atividade.pessoaLider = lider;
                                        });

                                        if (atividade.designado) {
                                            Pessoa.getById(atividade.designado).then(function (recurso) {

                                                var nomes = recurso.nome.split(" ");
                                                var iniciais = nomes[0].substring(0, 1);
                                                var nomeSimples = nomes[0];
                                                if (nomes.length > 1) {
                                                    iniciais += nomes[1].substring(0, 1);
                                                }
                                                recurso.iniciais = iniciais.toUpperCase();
                                                recurso.nomeSimples = nomeSimples;
                                                atividade.pessoaRecurso = recurso;
                                            });
                                        }
                                        atividade.timeObj = time;
                                    }
                                });
                                $scope.listaAtividades = atividades;
                                $scope.showLoading = false;
                            });
                        }
                    });
                }
            }

            $scope.initWorkspaceActivities = function () {
                loadTable();
            };
        }]);

angular.module('team-task')
    .controller('WorkspaceWorkforceController', ['$scope', '$rootScope', '$state', 'Atividade', 'Time',
        '$resource', '$filter', 'Pessoa', 'Projeto',
        function ($scope, $rootScope, $state, Atividade, Time, $resource, $filter, Pessoa, Projeto) {
            $scope.showLoading = false;
            /*
             $scope.dtAOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);
             $scope.dtAOptions.withOption('responsive', true);
             */
            $scope.ganttData = [];
            function loadTable() {
                $scope.showLoading = true;
                if($rootScope.usuarioLogado) {
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

                            var recursosTotais = [];
                            for (var a = 0; a < times.length; a++) {
                                recursosTotais = recursosTotais.concat(times[a].recursos);
                            }
                            recursosTotais = $filter('unique')(recursosTotais);
                            angular.forEach(recursosTotais, function (rec, idRec) {
                                Pessoa.getById(rec).then(function (pessoa) {
                                    if (pessoa) {

                                        var row = {
                                            "name": pessoa.nome
                                        };

                                        var aQtdQuery = {
                                            "time": {
                                                "$in": listaTimes
                                            },
                                            "designado": pessoa._id.$oid
                                        };
                                        Atividade.query(aQtdQuery).then(function (atividades) {

                                            row.tasks = [];

                                            for (var indexTimeAtividade = 0; indexTimeAtividade < atividades.length; indexTimeAtividade++) {
                                                row.tasks.push({
                                                    "name": atividades[indexTimeAtividade].nome,
                                                    "from": moment(atividades[indexTimeAtividade].inicio.$date),
                                                    "to": moment(atividades[indexTimeAtividade].fim.$date),
                                                    "color": "#F1C232"
                                                });
                                            }

                                            var pQtdQuery = {
                                                "administrador": idusuario,
                                                "status": "Ativo",
                                                "atividades.designado": pessoa._id.$oid
                                            };
                                            Projeto.query(pQtdQuery).then(function (projetos) {
                                                for (var p = 0; p < projetos.length; p++) {
                                                    for (var at = 0; at < projetos[p].atividades.length; at++) {
                                                        if (projetos[p].atividades[at].designado === pessoa._id.$oid) {

                                                            row.tasks.push({
                                                                "name": projetos[p].atividades[at].nome,
                                                                "from": moment(projetos[p].atividades[at].inicio.$date),
                                                                "to": moment(projetos[p].atividades[at].fim.$date),
                                                                "color": "#F1C232"
                                                            });
                                                        }
                                                    }
                                                }
                                                $scope.ganttData.push(row);
                                            });
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
                $scope.showLoading = false;
            }

            $scope.getColumnWidth = function(widthEnabled, scale, zoom) {
                if (!widthEnabled) {
                    return undefined;
                }

                if (scale.match(/.*?week.*?/)) {
                    return 150 * zoom;
                }

                if (scale.match(/.*?month.*?/)) {
                    return 300 * zoom;
                }

                if (scale.match(/.*?quarter.*?/)) {
                    return 500 * zoom;
                }

                if (scale.match(/.*?year.*?/)) {
                    return 800 * zoom;
                }
                return 40 * zoom;
            };

            $scope.initWorkspaceWorkforce = function () {

                $scope.dateFormat = "dddd, DD/MM/YYYY";
                $scope.ganttOptions = {
                    "zoom": 1,
                    "scale": "week",
                    "width": true,
                    "currentDate": 'line',
                    "tableHeaders": {'model.name': 'Recurso'},
                    "sortMode": "model.name",
                    "daily": true,
                    "taskContent": '<span></span>'
                };
                loadTable();
            };
        }]);