angular.module('team-task')
    .controller('ProjectController', ['$scope', '$rootScope', '$state', 'Projeto', 'Atividade', 'Time',
        'DTOptionsBuilder', '$resource', '$uibModal', '$stateParams', 'Pessoa', 'DTColumnDefBuilder',
        function ($scope, $rootScope, $state, Projeto, Atividade, Time, DTOptionsBuilder, $resource, $uibModal,
                  $stateParams, Pessoa, DTColumnDefBuilder) {
            $scope.showLoading = false;
            $scope.dtOptions = DTOptionsBuilder.newOptions().withLanguage($resource('js/dtOptions.json').get().$promise);
            $scope.dtOptions.columnDefs = [{
                "targets": [6],
                "searchable": true,
                "visible": false
            }];

            $scope.initWorkspaceProject = function () {
                $scope.showLoading = true;

                Projeto.getById($stateParams.id).then(function (projeto) {
                    if(projeto) {
                        $scope.projeto = projeto;
                        angular.forEach(projeto.atividades, function (atividade, idAtividade) {
                            Pessoa.getById(atividade.designado).then(function (pessoa) {
                                if(pessoa) {
                                    var nomes = pessoa.nome.split(" ");
                                    var iniciais = nomes[0].substring(0, 1);
                                    var nomeSimples = nomes[0];
                                    if (nomes.length > 1) {
                                        iniciais += nomes[1].substring(0, 1);
                                    }
                                    pessoa.iniciais = iniciais.toUpperCase();
                                    pessoa.nomeSimples = nomeSimples;

                                    atividade.pessoaDesignado = pessoa;
                                }
                            });
                        });
                        $scope.showLoading = false;
                    }
                });

            };

            $scope.editarAtividade = function (projeto) {
                $uibModal
                    .open({
                        templateUrl: 'views/modal/edit-project.html',
                        controller: 'ModalEditProjectController',
                        resolve: {
                            projetoEdicao: function () {
                                return projeto;
                            }
                        }
                    }).result.then(function () {
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
                    }, function () {
                    });
            }
        }]);