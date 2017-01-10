angular.module('team-task')
    .factory('SearchFactory', function SearchFactory(Pessoa, Projeto, Atividade, Time, $filter, $q, $rootScope) {
        SearchFactory.searchAll = function (text, scope) {
            scope.loadingSearch = true;
            var idusuario = $rootScope.usuarioLogado._id.$oid;
            var proms = [];
            scope.resultadoBusca = [];
            var proQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                },
                "$or": [
                    {"administrador": idusuario}
                    , {"atividades.designado": idusuario}]
            };
            proms.push(Projeto.query(proQuery).then(function (projetos) {

                angular.forEach(projetos, function (projeto) {
                    scope.resultadoBusca.push(
                        {
                            "nome": projeto.nome,
                            "tipo": "workspace.project",
                            "id": projeto._id.$oid
                        }
                    );
                });
            }));
            var proAtvQuery = {
                "atividades.nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                },
                "$or": [
                    {"administrador": idusuario}
                    , {"atividades.designado": idusuario}]
            };
            proms.push(Projeto.query(proAtvQuery).then(function (projetos) {
                angular.forEach(projetos, function (projeto) {
                    var proAtividades = $filter('filter')(projeto.atividades, {"nome": text});
                    if (proAtividades) {
                        angular.forEach(proAtividades, function (atividade) {
                            scope.resultadoBusca.push(
                                {
                                    "nome": projeto.nome + "/" + atividade.nome,
                                    "tipo": "workspace.project",
                                    "id": projeto._id.$oid
                                }
                            );
                        });
                    }
                });
            }));

            var aQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                }
            };
            proms.push(Atividade.query(aQuery).then(function (atividades) {
                angular.forEach(atividades, function (atividade) {
                    if(atividade.time) {
                        Time.getById(atividade.time).then(function (time) {
                            if(atividade.designado === idusuario || time.lider === idusuario) {
                                atividade.timeObj = time;
                                scope.resultadoBusca.push(
                                    {
                                        "nome": time.nome + " / " + atividade.nome,
                                        "tipo": "team-activity",
                                        "id": atividade.time,
                                        "atividade": atividade
                                    }
                                );
                            }
                        });
                    }
                });
            }));
            var peQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                },
                "$or": [
                    {"cadastrado": idusuario},
                    {"_id": { "$oid": idusuario } }
                ]
            };
            proms.push(Pessoa.query(peQuery).then(function (pessoas) {

                angular.forEach(pessoas, function (pessoa) {
                    scope.resultadoBusca.push(
                        {
                            "nome": pessoa.nome,
                            "tipo": "workspace.workforce",
                            "id": pessoa._id.$oid
                        }
                    );
                });
            }));

            var tQuery = {
                "nome": {
                    "$regex": text + ".*",
                    "$options": "gi"
                },
                "$or": [
                    {"lider": idusuario},
                    {"recursos": idusuario}
                ]
            };
            proms.push(Time.query(tQuery).then(function (times) {
                angular.forEach(times, function (time) {
                    scope.resultadoBusca.push(
                        {
                            "nome": time.nome,
                            "tipo": "workspace.team",
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