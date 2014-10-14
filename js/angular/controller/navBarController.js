IonicModule
.controller('$ionicNavBar', [
  '$scope',
  '$element',
  '$attrs',
  '$compile',
  '$animate',
  '$ionicHistory',
  '$ionicNavBarDelegate',
function($scope, $element, $attrs, $compile, $animate, $ionicHistory, $ionicNavBarDelegate) {
  var CSS_NAV_BAR_ACTIVE = 'nav-bar-active';
  var CSS_NAV_BAR_ENTERING = 'nav-bar-entering';
  var CSS_NAV_BAR_LEAVING = 'nav-bar-leaving';
  var CSS_HIDE = 'hide';
  var DATA_NAV_BAR_CTRL = '$ionNavBarController';

  var self = this;
  var primaryBtnsHtml, secondaryBtnsHtml, backBtnHtml;
  var title, previousTitle, navBarContainers = [];

  $element.parent().data(DATA_NAV_BAR_CTRL, self);

  var deregisterInstance = $ionicNavBarDelegate._registerInstance(this, $attrs.delegateHandle);


  self.init = function(classNames) {
    navBarContainers = [ self.createNavBar(classNames), self.createNavBar(classNames) ];
  };

  self.beforeEnter = function(viewData) {
    if ( self.shouldUpdate(viewData) ) {
      self.enable();
      var enteringContainer = getOffScreenNavBar();
      self.title(viewData.title, enteringContainer);
      self.transition(enteringContainer, getOnScreenNavBar(), viewData);
    }
  };

  self.shouldUpdate = function(viewData) {
    return !!viewData;
  };

  self.transition = function(enteringContainer, leavingContainer, viewData) {

    $animate.transition( 'nav-bar', viewData.transition, viewData.direction, enteringContainer.element(), leavingContainer && leavingContainer.element()).then(function(){
      for (var x=0; x<navBarContainers.length; x++) {
        navBarContainers[x].isActive = false;
      }
      enteringContainer.isActive = true;
    });

  };

  self.showBar = function(show) {
    if (arguments.length) {
      $scope.isInvisible = !show;
      $scope.$parent.$hasHeader = !!show;
    }
    return !$scope.isInvisible;
  };

  self.title = function(val, navBarContainer) {
    if (arguments.length) {
      previousTitle = title;
      title = val || '';
      navBarContainer = navBarContainer || getOnScreenNavBar();
      navBarContainer && navBarContainer.title(title);
    }
    return title;
  };

  self.getPreviousTitle = function() {
    return previousTitle;
  };

  self.showBackButton = function(show) {
    if (arguments.length) {
      $scope.backButtonShown = !!show;
    }
    return !!($scope.hasBackButton && $scope.backButtonShown);
  };

  self.back = function() {
    var backView = $ionicHistory.backView();
    backView && backView.go();
    return false;
  };

  self.registerButtons = function(btnsHtml, side) {
    if (side === 'secondary' || side === 'right') {
      secondaryBtnsHtml = btnsHtml;
    } else {
      primaryBtnsHtml = btnsHtml;
    }
  };

  self.registerBackButton = function(btnHtml) {
    backBtnHtml = btnHtml;
  };

  self.enable = function() {
    // set primary to show first
    self.isPrimary(true);

    // set non primary to hide second
    for (var x=0; x<$ionicNavBarDelegate._instances.length; x++) {
      if($ionicNavBarDelegate._instances[x] !== self) $ionicNavBarDelegate._instances[x].isPrimary(false);
    }
  };

  self.isPrimary = function(enable) {
    if (enable) {
      $element.removeClass(CSS_HIDE);
    } else {
      $element.addClass(CSS_HIDE);
    }
  };

  self.createNavBar = function(classNames) {
    var containerEle = jqLite( '<div class="nav-bar-container nav-bar-cache">' );

    var navBarEle = jqLite( '<div class="bar bar-header ' + classNames + '">' );

    var primaryBtnsEle = jqLite( '<div class="buttons primary-buttons left-buttons">' );
    if (primaryBtnsHtml) {
      primaryBtnsEle.html(primaryBtnsHtml);
    }

    var secondaryBtnsEle = jqLite( '<div class="buttons secondary-buttons right-buttons">' );
    if (secondaryBtnsHtml) {
      secondaryBtnsEle.html(secondaryBtnsHtml);
    }

    var titleEle = jqLite( '<div class="title">' );
    var title;

    navBarEle.append(primaryBtnsEle)
             .append(titleEle)
             .append(secondaryBtnsEle);

    containerEle.append(navBarEle);

    $element.append( $compile(containerEle)($scope) );

    return {
      isActive: false,
      title: function(val) {
        if(val !== title) {
          titleEle.html(val);
          title = val;
        }
      },
      element: function() {
        return containerEle;
      },
      destroy: function() {
        containerEle = navBarEle = primaryBtnsEle = secondaryBtnsEle = titleEle = null;
      }
    };
  };

  function getOnScreenNavBar() {
    for (var x=0; x<navBarContainers.length; x++) {
      if (navBarContainers[x].isActive) return navBarContainers[x];
    }
  }

  function getOffScreenNavBar() {
    for (var x=0; x<navBarContainers.length; x++) {
      if (!navBarContainers[x].isActive) return navBarContainers[x];
    }
    return navBarContainers[0];
  }

  $scope.$on('$destroy', function(){
    $element.parent().removeData(DATA_NAV_BAR_CTRL);
    for (var x=0; x<navBarContainers.length; x++) {
      navBarContainers[x].destroy();
    }
    navBarContainers = null;
    deregisterInstance();
  });

}]);

