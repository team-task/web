angular.module('team-task', [
    'ui.router', 'ngResource', 'mongolabResourceHttp', 'ui.bootstrap', 'angular.filter', 'ngLetterAvatar', 'angularMoment',
    'datatables', 'datatables.buttons', 'datatables.bootstrap',
    'ngAnimate',
    'gantt', 'gantt.table', 'gantt.tooltips', 'gantt.overlap', 'gantt.dependencies', 'gantt.progress',
    'checklist-model', 'ngSanitize', 'ngCsv', 'angular-md5'
])
    .constant('MONGOLAB_CONFIG', {API_KEY: 'YXgR-q92vuVCKlSm-ji3nplDTE7rHIQh', DB_NAME: 'tt'})
    .run(function (amMoment) {
        amMoment.changeLocale('pt-br');
    })
    .run(dtLanguageConfig)
    .run(function ($rootScope, $state, $window) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            var currentUser = angular.fromJson($window.sessionStorage.getItem('usuarioLogado'));
            var requireLogin = toState.data.requiredlogin;
            if (requireLogin && (!currentUser || typeof currentUser === 'undefined')) {
                event.preventDefault();
                $state.go('login');
            } else {
                $rootScope.usuarioLogado = currentUser;
            }
        });
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.currentState = toState.name;
        });
    })
    .filter('sumByKey', function () {
        return function (data, key) {
            if (typeof(data) === 'undefined' || typeof(key) === 'undefined') {
                return 0;
            }

            var sum = 0;
            angular.forEach(data, function (obj, objKey) {
                sum += parseFloat(obj[key]);
            });

            return sum;
        };
    })
    .filter('timeMils', function () {
        return function (data, key) {
            if(data) {
                return moment(data).toDate().getTime()
            } else {
                return 0
            }
        };
    });
function dtLanguageConfig (DTDefaultOptions) {
    DTDefaultOptions.setLanguage({
        "emptyTable": "Nenhum registro encontrado",
        "info": "Mostrando de _START_ até _END_ de _TOTAL_ registros",
        "infoEmpty": "Mostrando 0 até 0 de 0 registros",
        "infoFiltered": "(Filtrados de _MAX_ registros)",
        "infoPostFix": "",
        "infoThousands": ".",
        "lengthMenu": "_MENU_ resultados por página",
        "loadingRecords": "Carregando...",
        "processing": "Processando...",
        "zeroRecords": "Nenhum registro encontrado",
        "search": "Pesquisar",
        "paginate": {
            "next": "Próximo",
            "previous": "Anterior",
            "first": "Primeiro",
            "last": "Último"
        },
        "aria": {
            "sortAscending": ": Ordenar colunas de forma ascendente",
            "sortDescending": ": Ordenar colunas de forma descendente"
        }
    });
}
$(document).ready(function () {
    $(document).on('click', '.panel-heading span.clickable', function (e) {
        var $this = $(this);
        if (!$this.hasClass('panel-collapsed')) {
            $this.parents('.panel').find('.panel-body').slideUp();
            $this.addClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
        } else {
            $this.parents('.panel').find('.panel-body').slideDown();
            $this.removeClass('panel-collapsed');
            $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
        }
    });
});