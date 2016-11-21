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
                                , {"atividades.designado": idusuario}]
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

            function loadTable() {
                $scope.listaAtividades = [];
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
                                                "to": moment(atividades[indexTimeAtividade].fim.$date)
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
                                                            "to": moment(projetos[p].atividades[at].fim.$date)
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


                /*$scope.ganttData = [
                    {
                        name: 'Create concept', tasks: [
                        {
                            name: 'Create concept',
                            content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}}',
                            color: '#F1C232',
                            from: new Date(2013, 9, 10, 8, 0, 0),
                            to: new Date(2013, 9, 16, 18, 0, 0),
                            est: new Date(2013, 9, 8, 8, 0, 0),
                            lct: new Date(2013, 9, 18, 20, 0, 0),
                            progress: 100
                        }
                    ]
                    },
                    {
                        name: 'Finalize concept', tasks: [
                        {
                            name: 'Finalize concept',
                            color: '#F1C232',
                            from: new Date(2013, 9, 17, 8, 0, 0),
                            to: new Date(2013, 9, 18, 18, 0, 0),
                            progress: 100
                        }
                    ]
                    },
                    {
                        name: 'Development',
                        children: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'],
                        content: '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}'
                    },
                    {
                        name: 'Sprint 1', tooltips: false, tasks: [
                        {
                            name: 'Product list view',
                            color: '#F1C232',
                            from: new Date(2013, 9, 21, 8, 0, 0),
                            to: new Date(2013, 9, 25, 15, 0, 0),
                            progress: 25
                        }
                    ]
                    },
                    {
                        name: 'Sprint 2', tasks: [
                        {
                            name: 'Order basket',
                            color: '#F1C232',
                            from: new Date(2013, 9, 28, 8, 0, 0),
                            to: new Date(2013, 10, 1, 15, 0, 0)
                        }
                    ]
                    },
                    {
                        name: 'Sprint 3', tasks: [
                        {
                            name: 'Checkout',
                            color: '#F1C232',
                            from: new Date(2013, 10, 4, 8, 0, 0),
                            to: new Date(2013, 10, 8, 15, 0, 0)
                        }
                    ]
                    },
                    {
                        name: 'Sprint 4', tasks: [
                        {
                            name: 'Login & Signup & Admin Views',
                            color: '#F1C232',
                            from: new Date(2013, 10, 11, 8, 0, 0),
                            to: new Date(2013, 10, 15, 15, 0, 0)
                        }
                    ]
                    },
                    {name: 'Hosting'},
                    {
                        name: 'Setup', tasks: [
                        {
                            name: 'HW',
                            color: '#F1C232',
                            from: new Date(2013, 10, 18, 8, 0, 0),
                            to: new Date(2013, 10, 18, 12, 0, 0)
                        }
                    ]
                    },
                    {
                        name: 'Config', tasks: [
                        {
                            name: 'SW / DNS/ Backups',
                            color: '#F1C232',
                            from: new Date(2013, 10, 18, 12, 0, 0),
                            to: new Date(2013, 10, 21, 18, 0, 0)
                        }
                    ]
                    },
                    {name: 'Server', parent: 'Hosting', children: ['Setup', 'Config']},
                    {
                        name: 'Deployment', parent: 'Hosting', tasks: [
                        {
                            name: 'Depl. & Final testing',
                            color: '#F1C232',
                            from: new Date(2013, 10, 21, 8, 0, 0),
                            to: new Date(2013, 10, 22, 12, 0, 0),
                            'classes': 'gantt-task-deployment'
                        }
                    ]
                    },
                    {
                        name: 'Workshop', tasks: [
                        {
                            name: 'On-side education',
                            color: '#F1C232',
                            from: new Date(2013, 10, 24, 9, 0, 0),
                            to: new Date(2013, 10, 25, 15, 0, 0)
                        }
                    ]
                    },
                    {
                        name: 'Content', tasks: [
                        {
                            name: 'Supervise content creation',
                            color: '#F1C232',
                            from: new Date(2013, 10, 26, 9, 0, 0),
                            to: new Date(2013, 10, 29, 16, 0, 0)
                        }
                    ]
                    },
                    {
                        name: 'Documentation', tasks: [
                        {
                            name: 'Technical/User documentation',
                            color: '#F1C232',
                            from: new Date(2013, 10, 26, 8, 0, 0),
                            to: new Date(2013, 10, 28, 18, 0, 0)
                        }
                    ]
                    }
                ];
                */
                $scope.showLoading = false;
            }

            $scope.initWorkspaceWorkforce = function () {
                loadTable();
            };
        }]);