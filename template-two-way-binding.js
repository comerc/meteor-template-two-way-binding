/**
 * Coverts a Date object to a input[type='date'] value
 * @type {Function}
 * @return formatted value
 */
Date.prototype.toDateInputValue = (function() {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
});

var boundCount = 0;

TemplateTwoWayBinding = {};

TemplateTwoWayBinding.getter = function(variable) {
  // this - templateInstance context
  return Session.get(variable);
};

TemplateTwoWayBinding.setter = function(variable, value) {
  // this - templateInstance context
  Session.set(variable, value);
};

// TemplateTwoWayBinding.operator = function(variable, operator, params) {
//   // this - templateInstance context
//   // for custom code
// };

TemplateTwoWayBinding.rendered = function(templateInstance) {
  // If old school: Template.hello.rendered = TemplateTwoWayBinding.rendered
  if (this instanceof Blaze.TemplateInstance) {
    templateInstance = this;
  }
  var t = templateInstance;
  var eventHandler = function() {
    var $element = $(this);
    var variableArray = $element.attr('value-bind').split('|');
    var variable = variableArray[0];
    var value;
    if ($element.is('[contenteditable]')) {
      value = $element.html();
    } else {
      value = $element.val();
      var type = $element.prop('type');
      // Update the Session variable depending on the type of input element
      switch (type) {
        case 'checkbox':
          var checked = $element.is(':checked');
          var prevValue = getter.call(t, variable);
          if (prevValue) {
            // Create an array to generalize processing
            if(!_.isArray(prevValue)) {
                prevValue = [prevValue];
            }
            if (checked) {
              // Add the newly checked element to the array
              if (!_.contains(prevValue, value)) {
                prevValue.push(value);
              } else {
                return;
              }
            } else {
              // Remove the unchecked element from the array
              var index = prevValue.indexOf(value);
              if(index > -1) {
                prevValue.splice(index, 1);
              }
            }
            value = prevValue;
          } else if (!checked) {
            value = undefined;
          }
          // Format array
          if(_.size(value) === 0) {
            value = undefined;
          }
          if(_.size(value) === 1) {
            value = value[0];
          }
          break;
        case 'radio':
          value = $element.is(':checked') ? value : undefined;
          break;
        case 'range': // Fall through
        case 'number':
          var intValue = parseInt(value);
          value = isNaN(intValue) ? undefined : intValue;
          break;
        case 'date': // Fall through
        case 'datetime':
          value = value ? new Date(value) : undefined;
      }
    }
    $element.attr('is-setter', true);
    // Update the Session object with the computed value
    TemplateTwoWayBinding.setter.call(t, variable, value, $element);
  };
  // Loop through all variables we want to bind
  var elements = t.$('[value-bind]:not([bound-id])');
  // If our bound Session variable changes, update the corresponding element in the DOM
  elements.each(function() {
    var $element = $(this);
    // Set one time bound-id
    var boundId = ++boundCount;
    $element.attr('bound-id', boundId);
    var boundEventHandler = eventHandler;
    var variableArray = $element.attr('value-bind').split('|');
    var variable = variableArray.shift();
    _.each(variableArray, function(operatorItem) {
      var operatorArray = operatorItem.split(':');
      var operator = operatorArray.shift();
      switch (operator) {
        case 'throttle':
          var wait = 200, options = {};
          _.each(operatorArray, function(paramItem) {
            var testWait = parseInt(paramItem, 10);
            if (!_.isNaN(testWait)) {
              wait = testWait;
            }
            if (paramItem === 'notLeading') {
              options.leading = false;
            }
            if (paramItem === 'notTrailing') {
              options.trailing = false;
            }
          });
          boundEventHandler = _.throttle(boundEventHandler, wait, options);
          break;
        case 'debounce':
          var wait = 200, immediate = false;
          _.each(operatorArray, function(paramItem) {
            var testWait = parseInt(paramItem, 10);
            if (!_.isNaN(testWait)) {
              wait = testWait;
            }
            if (paramItem === 'immediate') {
              immediate = true;
            }
          });
          boundEventHandler = _.debounce(boundEventHandler, wait, immediate);
          break;
        // default:
        //   TemplateTwoWayBinding.operator.call(t, variable, operator, operatorArray);
        //   break;
      }
    });
    // Drag event for input[type='range'] IE support
    $element.on('input drag [bound-id=' + boundId + ']', boundEventHandler);
    t.autorun(function() {
      var value = TemplateTwoWayBinding.getter.call(t, variable, $element);
      if ($element.attr('is-setter')) {
        $element.removeAttr('is-setter');
        return;
      }
      if ($element.is('[contenteditable]')) {
        $element.html(value);
      } else {
        var type = $element.prop('type');
        // Format date object to match input[type='date'] format
        if (value instanceof Date) {
          value = (new Date).toDateInputValue();
        }
        if (type === 'checkbox' || type === 'radio') {
          // Find all matching DOM elements
          var selector = '[value-bind=\'' + variable + '\']';
          var elements = t.$(selector);
          if (value !== undefined) {
            // Ensure we have an array to loop over
            if (!_.isArray(value)) {
              value = new Array(value);
            }
            // Add checked property to all truthy values
            elements.each(function () {
              $element.prop('checked', false);
            });
            value.forEach(function (name) {
              t.$(selector + '[value=\'' + name + '\']').prop('checked', true);
            });
          }
        } else {
          // In this case we copy the Session variable to the value property
          $element.val(value);
        }
      }
    });
  });
};
