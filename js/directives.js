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
            link: function ($scope, elem, attr) {
                $document.on('click', eventHandler);

                function eventHandler(e) {
                    var element;
                    var contem = false;
                    for (element = e.target; element; element = element.parentNode) {
                        if (element.className && element.className.contains) {
                            if (element.className.contains("tt-search-listbox") || element.className.contains("tt-search-btn")) {
                                contem = true;
                            }
                        }
                    }

                    if (!contem) {
                        $scope.searchDisplay = "nodisplay";
                        if (!$scope.$$phase) $scope.$apply();
                    }
                }
            },
            controller: ['$scope', '$rootScope', '$uibModal', 'SearchFactory', '$document', 'idFactory', 'AjustesDB',
                function ($scope, $rootScope, $uibModal, SearchFactory, $document, idFactory, AjustesDB) {
                    $scope.textSearch = "";
                    $scope.searchDisplay = "nodisplay";
                    $scope.refactoryIdActivity = function () {
                        idFactory.refactoryIdActivity();
                    };
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
                    $scope.editarAtividadeTimeSearch = function (atividade) {
                        $uibModal
                            .open({
                                templateUrl: 'views/modal/edit-team-activity.html',
                                controller: 'ModalEditTeamActivityController',
                                resolve: {
                                    timeSelecionado: function () {
                                        return atividade.timeObj;
                                    },
                                    atividadeSelecionada: function () {
                                        return atividade;
                                    }
                                }
                            }).result.then(function () {
                            $rootScope.$emit("CallLoadMenus", {});
                        }, function () {
                        });
                    };
                    $scope.mostrarDetalheAtividadeTimeSearch = function (atividade) {
                        $uibModal
                            .open({
                                templateUrl: 'views/modal/view-team-activity.html',
                                controller: 'ModalViewTeamActivityController',
                                resolve: {
                                    atividadeSelecionada: function () {
                                        return atividade;
                                    }
                                }
                            }).result.then(function () {
                        }, function () {
                        });
                    };
                    $scope.ajustes = function () {
                        AjustesDB.ajusteNotasAtividades();
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

                    if ($state.current.data) {

                        loadMenus();

                        $rootScope.$on("CallLoadMenus", function () {
                            loadMenus();
                        });

                        $rootScope.$on("CallLoadProjectMenu", function () {
                            loadProjects();
                        });

                        $rootScope.$on("CallLoadTeamMenus", function () {
                            loadTeams();
                        });

                        $rootScope.$on("CallLoadWorkforceMenus", function () {
                            loadWorkforce();
                        });

                        $rootScope.$on("CallLoadWorkforceMenus", function () {
                            loadTimesheet();
                        });

                        function loadTimesheet() {
                            $scope.recursosMenu = [];
                            if ($rootScope.usuarioLogado) {
                                $scope.userManager = false;
                                $scope.menuTimesheetLoading = true;
                                if ($rootScope.usuarioLogado.perfil === 'lider') {
                                    $scope.userManager = true;
                                    var qPessoa = {
                                        cadastrado: $rootScope.usuarioLogado._id.$oid
                                    };
                                    Pessoa.query(qPessoa, {f: {'nome': 1, '_id': 1}}).then(function (pessoas) {
                                        $scope.recursosMenu = pessoas;
                                        $scope.menuTimesheetLoading = false;
                                    });
                                }
                            }
                        }

                        function loadProjects() {
                            $scope.projetosMenu = [];
                            if ($rootScope.usuarioLogado) {
                                $scope.menuProjetoLoading = true;
                                var idusuario;
                                if ($rootScope.usuarioLogado.perfil === 'gerente') {
                                    idusuario = $rootScope.usuarioLogado.subordinados[0];
                                } else {
                                    idusuario = $rootScope.usuarioLogado._id.$oid;
                                }
                                var pQuery = {
                                    "$or": [
                                        {"administrador": idusuario}, {"atividades.designado": idusuario}
                                    ],
                                    "status": {"$ne": "Concluído"}
                                };
                                Projeto.query(pQuery, {"sort": {"nome": 1}}).then(function (projetos) {
                                    $scope.projetosMenu = projetos;
                                    $scope.menuProjetoLoading = false;
                                });
                            }
                        }

                        function loadTeams() {
                            $scope.timesMenu = [];
                            if ($rootScope.usuarioLogado) {
                                $scope.menuAtividadesLoading = true;
                                var idusuario;
                                if ($rootScope.usuarioLogado.perfil === 'gerente') {
                                    idusuario = $rootScope.usuarioLogado.subordinados[0];
                                } else {
                                    idusuario = $rootScope.usuarioLogado._id.$oid;
                                }
                                var qTime = {
                                    "$or": [
                                        {"lider": idusuario}, {"recursos": idusuario}
                                    ]
                                };
                                Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {

                                    if (times[0]) {
                                        var listaTimes = [];
                                        for (var i = 0; i < times.length; i++) {
                                            listaTimes.push(times[i]._id.$oid);
                                        }

                                        $scope.timesMenu = times;
                                        $scope.menuAtividadesLoading = false;
                                    } else {
                                        $scope.menuAtividadesLoading = false;
                                    }
                                });
                            }
                        }

                        function loadWorkforce() {
                            $scope.trabalhoPessoasMenu = [];
                            if ($rootScope.usuarioLogado) {
                                $scope.menuCargaLoading = true;

                                if ($rootScope.usuarioLogado.perfil === 'gerente') {
                                    //por enquanto somente um subordinado.
                                    var arrayOids = [];
                                    //for (var r = 0; r < recursosTotais.length; r++) {
                                    arrayOids.push({"$oid": $rootScope.usuarioLogado.subordinados[0]});
                                    //}
                                    var pesQuery = {
                                        "_id": {
                                            "$in": arrayOids
                                        }
                                    };
                                    Pessoa.query(pesQuery).then(function (pessoas) {
                                        angular.forEach(pessoas, function (pessoa) {
                                            $scope.trabalhoPessoasMenu.push(pessoa);
                                        });
                                        $scope.menuCargaLoading = false;
                                    });

                                } else {

                                    var idusuario = $rootScope.usuarioLogado._id.$oid;

                                    var qTime = {
                                        "$or": [
                                            {"lider": idusuario},
                                            {"recursos": idusuario}
                                        ]
                                    };
                                    Time.query(qTime, {"sort": {"nome": 1}}).then(function (times) {

                                        if (times[0]) {
                                            /*
                                             var listaTimes = [];
                                             for (var i = 0; i < times.length; i++) {
                                             listaTimes.push(times[i]._id.$oid);
                                             }*/

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
                                        } else {
                                            $scope.menuCargaLoading = false;
                                        }
                                    });
                                }
                            }
                        }

                        function loadMenus() {
                            if ($rootScope.usuarioLogado) {
                                $scope.userManager = false;
                                loadProjects();
                                loadTeams();
                                loadWorkforce();
                                loadTimesheet();
                            }
                        }
                    }
                }]
        };
    })
    .directive('notas', function () {
        var ddo = {};
        ddo.restrict = 'A';
        ddo.scope = {
            nota: '=',
            indice: '=',
            remover: '&',
            editar: '&'
        };
        ddo.template = '<div class="row">' +
            '<div class="col-lg-12">' +
            '{{nota.data.$date | date:"dd/MM/yyyy"}}:' +
            '&nbsp;<span class="pointer-action" uib-tooltip="Editar nota" tooltip-placement="left"' +
            'ng-click="editar(indice);">' +
            '<i class="fa fa-pencil-square-o"></i>' +
            '</span>' +
            '&nbsp;<span class="pointer-action" uib-tooltip="Excluir nota" tooltip-placement="left"' +
            'ng-click="remover(indice)">' +
            '<i class="fa fa-minus-square-o"></i>' +
            '</span>' +
            '<pre class="nota-preline">{{nota.nota}}</pre>' +
            '</div>' +
            '</div>';
        return ddo;
    })
    .directive('heatmapTimesheetChart', function ($window) {
        var ddo = {};
        ddo.restrict = 'AE';
        ddo.template = "<svg></svg>";
        ddo.scope = {
            heatmapData: '=',
            heatmapDays: '=',
            heamapDaysMonth: '='
        };
        ddo.link = function (scope, elem, attrs) {
            var d3 = $window.d3;
            var rawSvg = elem.find("svg")[0];
            var margin = {top: 50, right: 0, bottom: 100, left: 100},
                width = 880 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom,
                gridSize = Math.floor(width / scope.heamapDaysMonth),
                legendElementWidth = gridSize * 2,
                buckets = 9,
                //colors = ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
                colors = ["#ffffd9", "#7fcdbb", "#1d91c0"],
                recursos = [],
                recursosLabels = [],
                dataPlot = [];


            scope.$watch('heatmapData', function (newVal, oldVal) {

                var svg = d3.select(rawSvg).attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                d3.selectAll('svg > g > *').remove();

                var dias = scope.heatmapDays;
                var diasLabel = svg.selectAll(".diasLabel")
                    .data(dias)
                    .enter().append("text")
                    .text(function (d) {
                        return d;
                    })
                    .attr("x", function (d, i) {
                        return i * gridSize;
                    })
                    .attr("y", 0)
                    .style("text-anchor", "middle")
                    .attr("transform", "translate(" + gridSize / 2 + ", -6)");

                recursosLabels = [];
                recursos = [];
                for (var b = 0; b < scope.heatmapData.length; b++) {
                    recursosLabels.push(scope.heatmapData[b].recurso);
                    recursos.push(b);
                }
                var recursosLabel = svg.selectAll(".recursosLabel")
                    .data(recursos)
                    .enter().append("text")
                    .text(function (d) {
                        return recursosLabels[d];
                    })
                    .attr("x", 0)
                    .attr("y", function (d, i) {
                        return i * gridSize;
                    })
                    .style("text-anchor", "end")
                    .attr("transform", "translate(-6," + gridSize / 1.5 + ")");
                for (var a = 0; a < scope.heatmapData.length; a++) {
                    dataPlot = dataPlot.concat(scope.heatmapData[a].horas)
                }
                var colorScale = d3.scaleQuantile()
                    .domain([0, 7, 9])
                    .range(colors);

                var cards = svg.selectAll(".hour")
                    .data(dataPlot, function (d) {
                        return d.recurso + ':' + d.data;
                    });
                cards.append("title");

                cards.enter().append("rect")
                    .attr("x", function (d) {
                        return (d.data - 1) * gridSize;
                    })
                    .attr("y", function (d) {
                        return (d.recurso - 1) * gridSize;
                    })
                    .attr("rx", 4)
                    .attr("ry", 4)
                    .attr("class", "hour bordered")
                    .attr("width", gridSize)
                    .attr("height", gridSize)
                    .style("fill", function (d) {
                        return colorScale(d.horas);
                    });

                cards.transition().duration(1000)
                    .style("fill", function (d) {
                        return colorScale(d.horas);
                    });

                cards.select("title").text(function (d) {
                    return d.horas;
                });

                cards.exit().remove();

                var legend = svg.selectAll(".legend")
                    .data([0].concat(colorScale.quantiles()), function (d) {
                        return d;
                    });

                legend.enter().append("g")
                    .attr("class", "legend");

                legend.append("rect")
                    .attr("x", function (d, i) {
                        return legendElementWidth * i;
                    })
                    .attr("y", height)
                    .attr("width", legendElementWidth)
                    .attr("height", gridSize / 2)
                    .style("fill", function (d, i) {
                        return colors[i];
                    });

                legend.append("text")
                    .text(function (d) {
                        return "≥ " + Math.round(d);
                    })
                    .attr("x", function (d, i) {
                        return legendElementWidth * i;
                    })
                    .attr("y", height + gridSize);

                legend.exit().remove();
            });
        };
        return ddo;
    });
function sendFileContent(contents) {
    return {"contents": contents};
}