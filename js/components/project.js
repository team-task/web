angular.module('team-task')
    .controller('ProjectController', ['$scope', '$rootScope', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$q', '$resource', '$uibModal', '$stateParams', 'Pessoa', '$window',
        function ($scope, $rootScope, Projeto, Atividade, Time, DTOptionsBuilder, $q, $resource, $uibModal,
                  $stateParams, Pessoa, $window) {
            $scope.showLoading = false;
            $scope.dtOptions = DTOptionsBuilder.newOptions();//.withLanguage($resource('js/dtOptions.json').get().$promise);
            $scope.dtOptions.withOption('order', [[3, "asc"]]);

            $scope.csvAtividades = [];

            $rootScope.$on("CallImportTemplate", function(contents){
                importTemplate(contents);
            });

            function importTemplate (contents) {
                console.log(contents);
                waitingDialog.hide();
            }

            $scope.initWorkspaceProject = function () {
                loadProject();
            };

            $scope.getHeader = function () {
                return ['Time', 'Atvidade', 'Status', 'Inicio', 'Duracao'];
            };

            function loadProject() {
                $scope.showLoading = true;

                Projeto.getById($stateParams.id).then(function (projeto) {
                    if (projeto) {
                        angular.forEach(projeto.atividades, function (atividade, idAtividade) {
                            if (atividade.designado) {
                                Pessoa.getById(atividade.designado).then(function (pessoa) {
                                    if (pessoa) {
                                        var nomes = pessoa.nome.split(" ");
                                        var iniciais = nomes[0].substring(0, 1);
                                        var nomeSimples = nomes[0];
                                        if (nomes.length > 1) {
                                            iniciais += nomes[1].substring(0, 1);
                                        }
                                        pessoa.iniciais = iniciais.toUpperCase();
                                        pessoa.nomeSimples = nomeSimples;

                                        atividade.pessoaDesignado = pessoa;
                                        atividade.nomeDesignado = pessoa.nome;
                                    }
                                });
                            }
                            if (atividade.time) {
                                Time.getById(atividade.time).then(function (time) {
                                    if (time) {
                                        atividade.nomeTime = time.nome;
                                    }
                                });
                            }
                            $scope.csvAtividades.push({
                                "Time": "",
                                "Atividade": atividade.nome,
                                "Status": atividade.status,
                                "Inicio": "",
                                "Duracao": ""
                            });
                        });
                        $scope.projeto = projeto;
                        $scope.showLoading = false;
                    }
                });
            }

            $scope.copiarAtividade = function (indice) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/copy-activity.html',
                        controller: 'ModalCopyProjectActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.moverAtividade = function (indice) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/cut-activity.html',
                        controller: 'ModalCutProjectActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.editarAtividade = function (indice) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-activity.html',
                        controller: 'ModalEditActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.novaAtividade = function () {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/new-activity.html',
                        controller: 'ModalNewActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            }
                        }
                    }).result.then(function () {
                        loadProject();
                        $rootScope.$emit("CallLoadMenus", {});
                    }, function () {
                    });
            };

            $scope.mostrarDetalheAtividade = function (indice) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/view-activity.html',
                        controller: 'ModalViewActivityController',
                        resolve: {
                            projetoSelecionado: function () {
                                return $scope.projeto;
                            },
                            indice: function () {
                                return indice;
                            }
                        }
                    }).result.then(function () {
                    }, function () {
                    });
            };
        }]);
