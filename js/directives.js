angular.module('team-task')
    .directive(
    "mAppLoading",
    function ($animate) {
        return ({
            link: link,
            restrict: "C"
        });
        function link(scope, element, attributes) {
            $animate.leave(element.children().eq(1)).then(
                function cleanupAfterAnimation() {
                    element.remove();
                    scope = element = attributes = null;
                }
            );
        }
    })
    .directive('header', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'views/header.html',
            controller: ['$scope', '$rootScope', '$uibModal', function ($scope, $rootScope, $uibModal) {
                $scope.myProfile = function () {
                    $uibModal
                        .open({
                            templateUrl: 'views/modal/my-profile.html',
                            controller: 'ModalMyProfileController'
                        }).result.then(function () {
                        }, function () {
                        });
                };
            }]
        };
    })
    .directive('fileReader', function() {
        return {
            scope: {
                fileReader:"="
            },
            link: function(scope, element) {
                $(element).on('change', function(changeEvent) {
                    var files = changeEvent.target.files;
                    if (files.length) {
                        var r = new FileReader();
                        r.onload = function(e) {
                            waitingDialog.show("Carregando Template. Aguarde.");
                            var contents = e.target.result;
                            scope.$apply(function () {
                                angular.element(element).val(null);
                                scope.$emit("CallImportTemplate", sendFileContent(contents));
                            });
                        };
                        r.readAsText(files[0]);
                    }
                });
            }
        };
    })
    .directive('leftNavigation', function () {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'views/left-navigation.html',
            controller: ['$scope', '$rootScope', 'Projeto', 'Time', 'Atividade', '$filter', 'Pessoa', '$state', '$q',
                function ($scope, $rootScope, Projeto, Time, Atividade, $filter, Pessoa, $state, $q) {

                    loadMenus();
                    $scope.collapsed = $state.current.data.collapsed;

                    $rootScope.$on("CallLoadMenus", function(){
                        loadMenus();
                    });

                    function loadMenus() {
                        $scope.menuProjetoLoading = true;
                        $scope.menuAtividadesLoading = true;
                        $scope.menuCargaLoading = true;
                        $scope.timesMenu = [];
                        $scope.projetosMenu = [];
                        $scope.trabalhoPessoasMenu = [];

                        if($rootScope.usuarioLogado) {

                            var idusuario = $rootScope.usuarioLogado._id.$oid;
                            var qTime = {
                                "$or": [
                                    {"lider": idusuario},
                                    {"recursos": idusuario}
                                ]
                            };
                            Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {

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
                                    Projeto.query(pQuery, {"sort": {"nome": 1}}).then(function (projetos) {
                                        $scope.projetosMenu = projetos;
                                        $scope.menuProjetoLoading = false;
                                    });
                                    $scope.timesMenu = times;
                                    $scope.menuAtividadesLoading = false;
                                    var aQuery = {
                                        "time": {
                                            "$in": listaTimes
                                        },
                                        "status": {
                                            "$in": ["aguardando", "iniciada"]
                                        }
                                    };

                                    Atividade.query(aQuery, {"sort": {"nome": 1}}).then(function (atividades) {
                                        var recursosTotais = [];
                                        for (var a = 0; a < times.length; a++) {
                                            recursosTotais = recursosTotais.concat(times[a].recursos);
                                            times[a].atividades = $filter('filter')(atividades, {'time': times[a]._id.$oid});
                                        }
                                        recursosTotais = $filter('unique')(recursosTotais);
                                        var promisses = [];
                                        angular.forEach(recursosTotais, function (rec, idRec) {
                                            var pessoaProm = Pessoa.getById(rec, {"sort": {"nome": 1}}).then(function (pessoa) {
                                                if (pessoa && (pessoa.cadastrado === idusuario || pessoa._id.$oid === idusuario)) {
                                                    pessoa.quantidadeAtividades = 0;
                                                    var aQtdQuery = {
                                                        "time": {
                                                            "$in": listaTimes
                                                        },
                                                        "designado": pessoa._id.$oid
                                                    };
                                                    Atividade.query(aQtdQuery, {"sort": {"nome": 1}}).then(function (atividades) {
                                                        pessoa.quantidadeAtividades += atividades.length;
                                                        var pQtdQuery = {
                                                            "administrador": idusuario,
                                                            "status": "Ativo",
                                                            "atividades.designado": pessoa._id.$oid
                                                        };
                                                        Projeto.query(pQtdQuery, {"sort": {"nome": 1}}).then(function (projetos) {
                                                            for (var p = 0; p < projetos.length; p++) {
                                                                for (var at = 0; at < projetos[p].atividades.length; at++) {
                                                                    if (projetos[p].atividades[at].designado === pessoa._id.$oid) {
                                                                        pessoa.quantidadeAtividades++;
                                                                    }
                                                                }
                                                            }
                                                            $scope.trabalhoPessoasMenu.push(pessoa);
                                                        });
                                                    });
                                                }
                                            });
                                            promisses.push(pessoaProm);
                                        });
                                        $q.all(promisses).then(function () {
                                            $scope.menuCargaLoading = false;
                                        });
                                    });
                                }
                            });
                        }
                    }


                    $scope.addToFav = function () {
                        console.log('added to favs');
                    };
                }]
        };
    });
function sendFileContent (contents) {
    return {"contents" : contents};
}