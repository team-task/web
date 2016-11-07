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
            controller: ['$scope', '$rootScope', 'Projeto', 'Grupo', 'Atividade',
                function ($scope, $rootScope, Projeto, Grupo, Atividade) {
                    var idusuario = $rootScope.usuarioLogado._id.$oid;
                    var qGrupo = {
                        "$or": [
                            {"gerente": idusuario},
                            {"recursos": idusuario}
                        ]
                    };
                    Grupo.query(qGrupo).then(function (grupos) {

                        if (grupos[0]) {
                            var listaGrupos = [];
                            for (var i = 0; i < grupos.length; i++) {
                                listaGrupos.push(grupos[i]._id.$oid);
                            }
                            var pQuery = {
                                "$or": [
                                    {"administrador": idusuario}
                                    , {"grupo": {"$in": listaGrupos}}]
                            };
                            Projeto.query(pQuery).then(function (projetos) {
                                $scope.projetos = projetos;
                            });
                            var aQuery = {

                            };
                            Atividade.query(aQuery).then(function () {

                            });
                            $scope.grupos = grupos;

                        }
                    });
                    $scope.addToFav = function () {
                        console.log('added to favs');
                    };
                }]
        };
    });
