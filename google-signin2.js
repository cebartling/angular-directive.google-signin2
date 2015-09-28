'use strict';

/*
 * angular-google-signin2-directive v0.0.1
 * ♡ CopyHeart 2015 by Christopher Bartling
 * Copying is an act of love. Please copy!
 *
 * https://developers.google.com/identity/sign-in/web/
 */

angular.module('directive.google-signin2', []).
    directive('googleSignIn2', ['$window', function ($window) {
        var ending = /\.apps\.googleusercontent\.com$/;

        return {
            restrict: 'E',
            transclude: true,
            template: '<span></span>',
            replace: true,
            link: function (scope, element, attrs, ctrl, linker) {
                attrs.clientid += (ending.test(attrs.clientid) ? '' : '.apps.googleusercontent.com');

                attrs.$set('data-clientid', attrs.clientid);
                attrs.$set('theme', attrs.theme);

                // Some default values, based on prior versions of this directive
                var defaults = {
                    scope: 'email',
                    width: 200,
                    height: 50,
                    longtitle: true,
                    theme: 'dark',
                    onsuccess: window.handleSuccess,
                    onfailure: window.handleFailure
                };
                defaults.theme = attrs.theme;

                var authDefaults = {
                    cookie_policy: 'single_host_origin'
                };
                authDefaults.client_id = attrs.clientid;

                // Overwrite default values if explicitly set
                angular.forEach(Object.getOwnPropertyNames(defaults), function (propName) {
                    if (attrs.hasOwnProperty(propName)) {
                        defaults[propName] = attrs[propName];
                    }
                });

                // Default language
                // Supported languages: https://developers.google.com/+/web/api/supported-languages
                attrs.$observe('language', function (value) {
                    $window.___gcfg = {
                        lang: value ? value : 'en'
                    };
                });

                // Asynchronously load the Google SDK.
                var po = document.createElement('script');
                po.type = 'text/javascript';
                po.async = true;
                //po.defer = true;
                po.src = 'https://apis.google.com/js/platform.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(po, s);

                linker(function (el, tScope) {
                    po.onload = function () {
                        if (el.length) {
                            element.append(el);
                        }
                        var googleAuth = gapi.auth2.init(authDefaults);
                        gapi.signin2.render(element[0], defaults);
                    };
                });
            }
        }
    }]).
    run(['$window', '$rootScope', function ($window, $rootScope) {

        // googleUser is a gapi.auth2.GoogleUser
        $window.handleSuccess = function (googleUser) {
            $rootScope.$broadcast('event:google-signin2-success', googleUser);
        };

        $window.handleFailure = function () {
            $rootScope.$broadcast('event:google-signin2-failure', {});
        };
    }]);
