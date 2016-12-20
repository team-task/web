angular.module('team-task')
    .controller('LoginController', ['$scope', '$rootScope', '$state', 'Pessoa', '$window', 'LoginFactory',
        function ($scope, $rootScope, $state, Pessoa, $window, LoginFactory) {
            var vm = this;
            vm.errorLogin = "";
            vm.usuario = "";
            vm.senha = "";
            $scope.initLogin = function () {
                $rootScope.loginBody = {
                    'overflow': 'hidden'
                };
            };

            $scope.login = function () {
                var usuario = vm.usuario;
                var senha = vm.senha;
                LoginFactory.login(usuario, senha, vm);
            };
        }]);