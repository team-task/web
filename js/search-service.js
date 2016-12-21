angular.module('team-task')
    .factory('SearchFactory', function SearchFactory(Pessoa, Projeto, Atividade, Time) {
        SearchFactory.searchAll = function (text, scope) {
            scope.resultadoBusca = [];
            var proQuery = {
                "$or": [
                    {
                        "nome": {
                            "$regex": text + ".*",
                            "$options": "gi"
                        }
                    },
                    {
                        "atividades.nome": {
                            "$regex": text + ".*",
                            "$options": "gi"
                        }
                    }
                ]
            };
            Projeto.query(proQuery).then(function (projetos) {

                angular.forEach(projetos, function (projeto) {
                    scope.resultadoBusca.push(
                        {
                            "nome": projeto.nome,
                            "tipo": "projeto",
                            "id": projeto._id.$oid
                        }
                    );
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
                            "tipo": "atividade",
                            "id": atividade._id.$oid
                        }
                    );
                });
            });
            Pessoa.query(nQuery).then(function (pessoas) {

                angular.forEach(pessoas, function (pessoa) {
                    scope.resultadoBusca.push(
                        {
                            "nome": pessoa.nome,
                            "tipo": "pessoa",
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
                            "tipo": "time",
                            "id": time._id.$oid
                        }
                    );
                });
            });


        };
        return SearchFactory;
    });