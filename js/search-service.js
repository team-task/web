angular.module('team-task')
    .factory('SearchFactory', function SearchFactory(Pessoa, Projeto, Atividade, Time, $filter) {
        SearchFactory.searchAll = function (text, scope) {
            scope.resultadoBusca = [];
            var proQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                }
            };
            Projeto.query(proQuery).then(function (projetos) {

                angular.forEach(projetos, function (projeto) {
                    scope.resultadoBusca.push(
                        {
                            "nome": projeto.nome,
                            "tipo": "project",
                            "id": projeto._id.$oid
                        }
                    );
                });
            });
            var proAtvQuery = {
                "atividades.nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                }
            };
            Projeto.query(proAtvQuery).then(function (projetos) {
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
            });

            var nQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                }

            };
            Atividade.query(nQuery).then(function (atividades) {

                angular.forEach(atividades, function (atividade) {
                    scope.resultadoBusca.push(
                        {
                            "nome": atividade.nome,
                            "tipo": "team-activities",
                            "id": atividade.time
                        }
                    );
                });
            });
            Pessoa.query(nQuery).then(function (pessoas) {

                angular.forEach(pessoas, function (pessoa) {
                    scope.resultadoBusca.push(
                        {
                            "nome": pessoa.nome,
                            "tipo": "workforce",
                            "id": pessoa._id.$oid
                        }
                    );
                });
            });

            Time.query(nQuery).then(function (times) {
                angular.forEach(times, function (time) {
                    scope.resultadoBusca.push(
                        {
                            "nome": time.nome,
                            "tipo": "team-activities",
                            "id": time._id.$oid
                        }
                    );
                });
            });


        };
        return SearchFactory;
    });