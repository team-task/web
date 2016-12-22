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
    .directive('header', ['$document', function ($document) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'views/header.html',
            link: function($scope, elem, attr) {
                $document.on('click', eventHandler);

                function eventHandler (e) {
                    var element;
                    var contem = false;
                    for (element = e.target; element; element = element.parentNode) {
                        if(element.className) {
                            if (element.className.contains("tt-search-listbox") || element.className.contains("tt-search-btn")) {
                                contem = true;
                            }
                        }
                    }

                    if(!contem) {
                        $scope.searchDisplay = "nodisplay";
                        if (!$scope.$$phase) $scope.$apply();
                    }
                }
            },
            controller: ['$scope', '$rootScope', '$uibModal', 'SearchFactory', '$document',
                function ($scope, $rootScope, $uibModal, SearchFactory, $document) {
                    $scope.textSearch = "";
                    $scope.searchDisplay = "nodisplay";
                    $scope.searchAll = function () {
                        if ($scope.textSearch.length > 1) {
                            var text = $scope.textSearch.trim();
                            $scope.searchDisplay = "display";
                            SearchFactory.searchAll(text, $scope);
                        }
                    };
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
    }])
    .directive('fileReader', function () {
        return {
            scope: {
                fileReader: "="
            },
            link: function (scope, element) {
                $(element).on('change', function (changeEvent) {
                    var files = changeEvent.target.files;
                    if (files.length) {
                        var r = new FileReader();
                        r.onload = function (e) {
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

                    if($state.current.data) {
                        $scope.menuClass = "col-md-3";
                        $scope.mainClass = "col-md-9";

                        loadMenus();
                        $scope.collapsed = $state.current.data.collapsed;

                        $rootScope.$on("CallLoadMenus", function () {
                            loadMenus();
                        });

                        function loadMenus() {
                            $scope.menuProjetoLoading = true;
                            $scope.menuAtividadesLoading = true;
                            $scope.menuCargaLoading = true;
                            $scope.timesMenu = [];
                            $scope.projetosMenu = [];
                            $scope.trabalhoPessoasMenu = [];

                            if ($rootScope.usuarioLogado) {

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

                                        /*var aQuery = {
                                            "time": {
                                                "$in": listaTimes
                                            },
                                            "status": {
                                                "$in": ["aguardando", "iniciada"]
                                            }
                                        };*/

                                        //Atividade.query(aQuery, {"sort": {"nome": 1}}).then(function (atividades) {
                                            var recursosTotais = [];
                                            for (var a = 0; a < times.length; a++) {
                                                recursosTotais = recursosTotais.concat(times[a].recursos);
                                                /*
                                                if (times[a].lider === $rootScope.usuarioLogado._id.$oid) {
                                                    times[a].atividades = $filter('filter')(atividades,
                                                        {'time': times[a]._id.$oid});
                                                } else {
                                                    times[a].atividades = $filter('filter')(atividades,
                                                        {
                                                            'time': times[a]._id.$oid,
                                                            'designado': $rootScope.usuarioLogado._id.$oid
                                                        });
                                                }
                                                */
                                            }
                                            recursosTotais = $filter('unique')(recursosTotais);
                                            //var promisses = [];

                                        var arrayOids = [];
                                        for (var r = 0; r < recursosTotais.length; r++) {
                                            arrayOids.push({"$oid": recursosTotais[r]});
                                        }
                                        var pesQuery = {
                                            "_id": {
                                                "$in": arrayOids
                                            }
                                        };
                                        Pessoa.query(pesQuery).then(function (pessoas) {
                                            angular.forEach(pessoas, function (pessoa) {
                                            //angular.forEach(recursosTotais, function (rec, idRec) {
                                                //var pessoaProm = Pessoa.getById(rec, {"sort": {"nome": 1}}).then(function (pessoa) {
                                                    if (pessoa && (pessoa.cadastrado === idusuario || pessoa._id.$oid === idusuario)) {
                                                        $scope.trabalhoPessoasMenu.push(pessoa);
                                                        /*
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
                                                        */
                                                    }
                                                //});
                                                //promisses.push(pessoaProm);
                                            });
                                            //$q.all(promisses).then(function () {
                                                $scope.menuCargaLoading = false;
                                            //});
                                        });
                                        //});
                                    }
                                });
                            }
                        }
                    } else {
                        $scope.menuClass = "nodisplay";
                        $scope.mainClass = "col-md-12 maxima";
                    }
                }]
        };
    });
function sendFileContent(contents) {
    return {"contents": contents};
}