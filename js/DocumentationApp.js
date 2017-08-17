var documentationApp = angular.module('DocumentationApp', ['ui.bootstrap'], function($rootScopeProvider) {
    $rootScopeProvider.digestTtl(100);
});

documentationApp.factory('sessionTimeOutInterceptor', function () {
    return {
        response: function (response) {
            if (typeof response.data == "string") {
                if (response.data == "" || response.data.indexOf('страницу авторизации') != -1) {
                    window.location = authUrl;
                }
            }
            return response;
        }
    };
});

documentationApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    $httpProvider.interceptors.push('sessionTimeOutInterceptor');
}]);


$(document).ready(function () {
    $(window).resize(function () {
        var angularScope = angular.element(document.getElementById('DocumentationController')).scope();
        angularScope.resizeDocTable();
    });
});
