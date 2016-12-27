angular.module('team-task')
    .factory('SearchFactory', function SearchFactory(Pessoa, Projeto, Atividade, Time, $filter, $q) {
        SearchFactory.searchAll = function (text, scope) {
            scope.loadingSearch = true;
            var proms = [];
            scope.resultadoBusca = [];
            var proQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                }
            };
            proms.push(Projeto.query(proQuery).then(function (projetos) {

                angular.forEach(projetos, function (projeto) {
                    scope.resultadoBusca.push(
                        {
                            "nome": projeto.nome,
                            "tipo": "project",
                            "id": projeto._id.$oid
                        }
                    );
                });
            }));
            var proAtvQuery = {
                "atividades.nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                }
            };
            proms.push(Projeto.query(proAtvQuery).then(function (projetos) {
                angular.forEach(projetos, function (projeto) {
                    var proAtividades = $filter('filter')(projeto.atividades, {"nome": text});
                    if (proAtividades) {
                        angular.forEach(proAtividades, function (atividade) {
                            scope.resultadoBusca.push(
                                {
                                    "nome": projeto.nome + "/" + atividade.nome,
                                    "tipo": "project",
                                    "id": projeto._id.$oid
                                }
                            );
                        });
                    }
                });
            }));

            var nQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                }

            };
            proms.push(Atividade.query(nQuery).then(function (atividades) {
                angular.forEach(atividades, function (atividade) {
                    if(atividade.time) {
                        Time.getById(atividade.time).then(function (time) {
                            atividade.timeObj = time;
                            scope.resultadoBusca.push(
                                {
                                    "nome": time.nome + " / " + atividade.nome,
                                    "tipo": "team-activity",
                                    "id": atividade.time,
                                    "atividade": atividade
                                }
                            );
                        });
                    }
                });
            }));
            proms.push(Pessoa.query(nQuery).then(function (pessoas) {

                angular.forEach(pessoas, function (pessoa) {
                    scope.resultadoBusca.push(
                        {
                            "nome": pessoa.nome,
                            "tipo": "workforce",
                            "id": pessoa._id.$oid
                        }
                    );
                });
            }));

            proms.push(Time.query(nQuery).then(function (times) {
                angular.forEach(times, function (time) {
                    scope.resultadoBusca.push(
                        {
                            "nome": time.nome,
                            "tipo": "team-activities",
                            "id": time._id.$oid
                        }
                    );
                });
            }));
            $q.all(proms).then(function () {
                scope.loadingSearch = false;
            });

        };
        return SearchFactory;
    });