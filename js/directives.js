angular.module('team-task')
    .directive('header', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'views/header.html',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {

            }]
        };
    })
    .directive('leftNavigation', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'views/left-navigation.html',
            controller: ['$scope', '$rootScope', 'Projeto', 'Time', 'Atividade', '$filter', 'Pessoa',
                function ($scope, $rootScope, Projeto, Time, Atividade, $filter, Pessoa) {

                    loadMenus();

                    $rootScope.$on("CallLoadMenus", function(){
                        loadMenus();
                    });

                    function loadMenus() {
                        $scope.projetos = [];
                        $scope.atividades = [];
                        $scope.trabalhoPessoas = [];
                        var idusuario = $rootScope.usuarioLogado._id.$oid;
                        var qTime = {
                            "$or": [
                                {"lider": idusuario},
                                {"recursos": idusuario}
                            ]
                        };
                        Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {

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
                                Projeto.query(pQuery, {"sort": {"nome": 1}}).then(function (projetos) {
                                    $scope.projetos = projetos;
                                });
                                $scope.times = times;
                                var aQuery = {
                                    "time": {
                                        "$in": listaTimes
                                    },
                                    "status": {
                                        "$in": ["aguardando", "iniciada"]
                                    }
                                };
                                Atividade.query(aQuery, {"sort": {"nome": 1}}).then(function (atividades) {
                                    $scope.atividades = atividades;
                                    angular.forEach(times, function (time, idTime) {
                                        time.atividades = $filter('filter')(atividades, {'time' : time._id.$oid});
                                    });

                                });
                                var recursosTotais = [];
                                for(var a = 0;a < times.length; a++) {
                                    recursosTotais = recursosTotais.concat(times[a].recursos);
                                }
                                recursosTotais = $filter('unique')(recursosTotais);
                                angular.forEach(recursosTotais, function (rec, idRec) {
                                    Pessoa.getById(rec, {"sort": {"nome": 1}}).then(function (pessoa) {
                                        if(pessoa) {
                                            pessoa.quantidadeAtividades = 0;
                                            var aQtdQuery = {
                                                "time": {
                                                    "$in": listaTimes
                                                },
                                                "designado": pessoa._id.$oid
                                            };
                                            Atividade.query(aQtdQuery, {"sort": {"nome": 1}}).then(function (atividades) {
                                                pessoa.quantidadeAtividades += atividades.length;
                                                var pQtdQuery = {
                                                    "administrador": idusuario,
                                                    "status": "Ativo",
                                                    "atividades.designado": pessoa._id.$oid
                                                };
                                                Projeto.query(pQtdQuery, {"sort": {"nome": 1}}).then(function (projetos) {
                                                    for (var p = 0; p < projetos.length; p++) {
                                                        for (var at = 0; at < projetos[p].atividades.length; at++) {
                                                            if(projetos[p].atividades[at].designado === pessoa._id.$oid) {
                                                                pessoa.quantidadeAtividades++;
                                                            }
                                                        }
                                                    }
                                                    $scope.trabalhoPessoas.push(pessoa);
                                                });
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }


                    $scope.addToFav = function () {
                        console.log('added to favs');
                    };
                }]
        };
    });
