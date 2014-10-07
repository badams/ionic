/**
 * @ngdoc directive
 * @name ionNavView
 * @module ionic
 * @restrict E
 * @codepen odqCz
 *
 * @description
 * As a user navigates throughout your app, Ionic is able to keep track of their
 * navigation history. By knowing their history, transitions between views
 * correctly slide either left or right, or no transition at all. An additional
 * benefit to Ionic's navigation system is its ability to manage multiple
 * histories.
 *
 * Ionic uses the AngularUI Router module so app interfaces can be organized
 * into various "states". Like Angular's core $route service, URLs can be used
 * to control the views. However, the AngularUI Router provides a more powerful
 * state manager in that states are bound to named, nested, and parallel views,
 * allowing more than one template to be rendered on the same page.
 * Additionally, each state is not required to be bound to a URL, and data can
 * be pushed to each state which allows much flexibility.
 *
 * The ionNavView directive is used to render templates in your application. Each template
 * is part of a state. States are usually mapped to a url, and are defined programatically
 * using angular-ui-router (see [their docs](https://github.com/angular-ui/ui-router/wiki),
 * and remember to replace ui-view with ion-nav-view in examples).
 *
 * @usage
 * In this example, we will create a navigation view that contains our different states for the app.
 *
 * To do this, in our markup we use ionNavView top level directive. To display a header bar we use
 * the {@link ionic.directive:ionNavBar} directive that updates as we navigate through the
 * navigation stack.
 *
 * You can use any [animation class](/docs/components#animations) on the navView's `animation` attribute
 * to have its pages animate.
 *
 * Recommended for page transitions: 'slide-left-right', 'slide-left-right-ios7', 'slide-in-up'.
 *
 * ```html
 * <ion-nav-bar></ion-nav-bar>
 * <ion-nav-view animation="slide-left-right">
 *   <!-- Center content -->
 * </ion-nav-view>
 * ```
 *
 * Next, we need to setup our states that will be rendered.
 *
 * ```js
 * var app = angular.module('myApp', ['ionic']);
 * app.config(function($stateProvider) {
 *   $stateProvider
 *   .state('index', {
 *     url: '/',
 *     templateUrl: 'home.html'
 *   })
 *   .state('music', {
 *     url: '/music',
 *     templateUrl: 'music.html'
 *   });
 * });
 * ```
 * Then on app start, $stateProvider will look at the url, see it matches the index state,
 * and then try to load home.html into the `<ion-nav-view>`.
 *
 * Pages are loaded by the URLs given. One simple way to create templates in Angular is to put
 * them directly into your HTML file and use the `<script type="text/ng-template">` syntax.
 * So here is one way to put home.html into our app:
 *
 * ```html
 * <script id="home" type="text/ng-template">
 *   <!-- The title of the ion-view will be shown on the navbar -->
 *   <ion-view title="Home">
 *     <ion-content ng-controller="HomeCtrl">
 *       <!-- The content of the page -->
 *       <a href="#/music">Go to music page!</a>
 *     </ion-content>
 *   </ion-view>
 * </script>
 * ```
 *
 * This is good to do because the template will be cached for very fast loading, instead of
 * having to fetch them from the network.
 *
 * Please visit [AngularUI Router's docs](https://github.com/angular-ui/ui-router/wiki) for
 * more info. Below is a great video by the AngularUI Router guys that may help to explain
 * how it all works:
 *
 * <iframe width="560" height="315" src="//www.youtube.com/embed/dqJRoh8MnBo"
 * frameborder="0" allowfullscreen></iframe>
 *
 * @param {string=} name A view name. The name should be unique amongst the other views in the
 * same state. You can have views of the same name that live in different states. For more
 * information, see ui-router's [ui-view documentation](http://angular-ui.github.io/ui-router/site/#/api/ui.router.state.directive:ui-view).
 */
IonicModule
.directive('ionNavView', [
  '$ionicViewService',
  '$state',
function( $ionicViewService, $state) {
  // IONIC's fork of Angular UI Router, v0.2.10
  // the navView handles registering views in the history and how to transition between them

  var directive = {
    restrict: 'E',
    terminal: true,
    priority: 2000,
    transclude: true,
    controller: function(){},
    compile: function (tElement, attr, transclude) {

      // a nav view element is a container for numerous views
      tElement.addClass('view-container');
      tElement.removeAttr('title');

      return function(navViewScope, navViewElement, navViewAttrs, navViewCtrl) {
        var latestLocals;
        var navViewName = navViewAttrs[directive.name] || navViewAttrs.name || '';

        // Put in the compiled initial view
        transclude(navViewScope, function(clone){
          navViewElement.append( clone );
        });

        // Find the details of the parent view directive (if any) and use it
        // to derive our own qualified view name, then hang our own details
        // off the DOM so child directives can find it.
        var parent = navViewElement.parent().inheritedData('$uiView');
        var parentViewName = ((parent && parent.state) ? parent.state.name : '');
        if (navViewName.indexOf('@') < 0) navViewName  = navViewName + '@' + parentViewName;

        var viewData = { name: navViewName, state: null };
        navViewElement.data('$uiView', viewData);

        // listen for $stateChangeSuccess
        navViewScope.$on('$stateChangeSuccess', function() {
          updateView(false);
        });
        navViewScope.$on('$viewContentLoading', function() {
          updateView(false);
        });

        // initial load, ready go
        updateView(true);


        function updateView(firstTime) {
          // get the current local according to the $state
          var currentLocals = $state.$current && $state.$current.locals[navViewName];

          // do not update THIS nav-view if its is not the container for the given state
          // if the currentLocals are the same as THIS latestLocals, then nothing to do
          if (!currentLocals || (!firstTime && currentLocals === latestLocals)) return;

          // register the view and figure out where it lives in the various
          // histories and nav stacks along with how views should enter/leave
          var transition = $ionicViewService.getTransition(navViewScope, navViewElement, navViewAttrs, currentLocals);

          // update the latestLocals
          latestLocals = currentLocals;
          viewData.state = currentLocals.$$state;

          // init the transition of views for this nav-view directive
          childDirection = null;
          transition.init(function(){
            // compiled, in the dom and linked, now animate
            // and pass in a childDirection if one was emitted
            transition.animate( childDirection );
          });

        }

        var childDirection;
        function childViewRegisteredDirection(ev, d) {
          childDirection = d;
        }
        // list for any child nav-views that emit a direction
        navViewScope.$on('$ionicView.direction', childViewRegisteredDirection);

      };
    }
  };
  return directive;
}]);

