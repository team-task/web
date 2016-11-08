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
            controller: ['$scope', '$rootScope', 'Projeto', 'Grupo', 'Atividade', '$filter',
                function ($scope, $rootScope, Projeto, Grupo, Atividade, $filter) {

                    $scope.new_palette = ["#d3e22b","#bbd534","#a6ca3a","#8fbe3d","#79b340","#63aa42","#48a044","#249744"];

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
                            $scope.grupos = grupos;
                            var aQuery = {
                                "grupo": {
                                    "$in": listaGrupos
                                }
                            };
                            Atividade.query(aQuery).then(function (atividades) {
                                $scope.atividades = atividades;
                                angular.forEach(grupos, function (grupo, idGrupo) {
                                    grupo.atividades = $filter('filter')(atividades, {'grupo' : grupo._id.$oid});
                                });
                            });
                        }
                    });
                    $scope.addToFav = function () {
                        console.log('added to favs');
                    };
                }]
        };
    });
