angular.module('team-task')
    .factory('idFactory', function idFactory(Projeto, $q, md5) {
        idFactory.refactoryIdActivity = function (scope) {
            Projeto.all().then(function (projetos) {
                var proms = [];
                angular.forEach(projetos, function (projeto) {
                    if(projeto.atividades) {
                        for (var index = 0; index < projeto.atividades.length; index++) {
                            projeto.atividades[index].id =
                                md5.createHash(projeto.nome + projeto.atividades[index].nome + index);
                        }
                        proms.push(projeto.$saveOrUpdate().then(function () {}));
                    }
                });
                $q.all(proms).then(function () {
                    console.log("salvou");
                }, function () {
                    console.log("errouuuu");
                });
            });
        };

        return idFactory;

    });