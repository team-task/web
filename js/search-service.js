angular.module('team-task')
    .factory('SearchFactory', function SearchFactory(Pessoa, Projeto, Atividade, Time) {
        SearchFactory.searchAll = function (text) {
            var resultadoBusca = [];
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
                    resultadoBusca.push(
                        {
                            "nome": projeto.nome,
                            "tipo": "projeto",
                            "id": projeto._id.$oid
                        }
                    );
                });
            });

            proQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                }

            };
            Atividade.query(proQuery).then(function (atividades) {

                angular.forEach(atividades, function (atividade) {
                    resultadoBusca.push(
                        {
                            "nome": atividade.nome,
                            "tipo": "atividade",
                            "id": atividade._id.$oid
                        }
                    );
                });
            });
            Pessoa.query(proQuery).then(function (pessoas) {

                angular.forEach(pessoas, function (pessoa) {
                    resultadoBusca.push(
                        {
                            "nome": pessoa.nome,
                            "tipo": "pessoa",
                            "id": pessoa._id.$oid
                        }
                    );
                });
            });

            Time.query(proQuery).then(function (times) {
                angular.forEach(times, function (time) {
                    resultadoBusca.push(
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