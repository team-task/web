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
                angular.forEach(projetos, function (projeto, idProjeto) {
                    resultadoBusca.push(
                        {
                            "nome": projeto.nome,
                            "tipo": "projeto",
                            "id": projeto._id.$oid
                        }
                    );
                });
            });
            Atividade.query()
        };
        return SearchFactory;
    });