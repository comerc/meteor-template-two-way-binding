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
var boundMap = {};

// ???
Template.onDestroyed(function() {
  var t = this;
  _.each(boundMap, function(boundEventHandler) {
    if (boundEventHandler.t === t) {
      delete(boundEventHandler.t);
    }
  });
});

TemplateTwoWayBinding = {};

TemplateTwoWayBinding.getter = function(variable) {
  return Session.get(variable);
};

TemplateTwoWayBinding.setter = function(variable, value) {
  Session.set(variable, value);
};

var eventHandler = function($element) {
  var t = this;
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

Template.body.events({
  // Drag event for input[type='range'] IE support
  'input, drag [value-bind]': function(e) {
    var $element = $(e.target);
    var boundId = $element.attr('bound-id');
    var boundEventHandler = boundMap[boundId];
    var f = boundEventHandler.f;
    var t = boundEventHandler.t;
    f.call(t, $element);
  }
});

TemplateTwoWayBinding.rendered = function() {
  var t = this;
  // Loop through all variables we want to bind
  var elements = t.$('[value-bind]:not([bound-id])');
  // If our bound Session variable changes, update the corresponding element in the DOM
  elements.each(function() {
    var $element = $(this);
    // Set one time bound-id
    var boundId = ++boundCount;
    $element.attr('bound-id', boundId);
    var variableArray = $element.attr('value-bind').split('|');
    var variable = variableArray[0];
    var decorator = variableArray[1];
    var boundEventHandler = { t: t };
    if (decorator && ['throttle', 'debounce'].indexOf(decorator.slice(0, 8)) != -1) {
      var decoratorArray = decorator.split(':');
      var wait = parseInt(decoratorArray[1], 10) || 200;
      decorator = decoratorArray[0];
      boundEventHandler.f = _[decorator](eventHandler, wait);
    } else {
      boundEventHandler.f = eventHandler;
    }
    // Set events and context by bound-id
    boundMap[boundId] = boundEventHandler;
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
