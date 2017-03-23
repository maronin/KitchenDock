import angular from 'angular';
import angularMeteor from 'angular-meteor';
export default angular.module('ngRepeatFinished', [
	angularMeteor
])
.directive('onFinishRender', function($timeout) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {		
			if (scope.$last === true) {
				$timeout(function() {
					scope.$emit(attr.broadcasteventname ? attr.broadcasteventname : 'ngRepeatFinished');
				});
			}

		}
	};
});