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
            controller: ['$scope', '$rootScope', 'Projeto', 'Time', 'Atividade', '$filter',
                function ($scope, $rootScope, Projeto, Time, Atividade, $filter) {

                    loadMenus();

                    $rootScope.$on("CallLoadMenus", function(){
                        loadMenus();
                    });

                    function loadMenus() {
                        $scope.projetos = [];
                        $scope.atividades = [];
                        var idusuario = $rootScope.usuarioLogado._id.$oid;
                        var qTime = {
                            "$or": [
                                {"lider": idusuario},
                                {"recursos": idusuario}
                            ]
                        };
                        Time.query(qTime).then(function (times) {

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
                                Projeto.query(pQuery).then(function (projetos) {
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
                                Atividade.query(aQuery).then(function (atividades) {
                                    $scope.atividades = atividades;
                                    angular.forEach(times, function (time, idTime) {
                                        time.atividades = $filter('filter')(atividades, {'time' : time._id.$oid});
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
