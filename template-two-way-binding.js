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

var boundId = 0;
var boundMap = {};

TemplateTwoWayBinding = {};

TemplateTwoWayBinding.getter = function(variable) {
  return Session.get(variable);
};

TemplateTwoWayBinding.setter = function(variable, value) {
  Session.set(variable, value);
};

var eventHandler = function(e, t) {
  var $target = $(e.target);
  var variableArray = $target.attr('value-bind').split('|');
  var variable = variableArray[0];
  var value = $target.val();
  var type = $target.prop('type');
  // Update the Session variable depending on the type of input element
  switch (type) {
    case 'checkbox':
      var checked = $target.is(':checked');
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
      value = $target.is(':checked') ? value : undefined;
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
  // Update the Session object with the computed value
  TemplateTwoWayBinding.setter.call(t, variable, value);
};

Template.body.events({
  // Drag event for input[type='range'] IE support
  'input, change, drag [value-bind]': function(e) {
    var $target = $(e.target);
    var boundId = $target.attr('bound-id');
    var boundEventHandler = boundMap[boundId];
    var f = boundEventHandler.f;
    var t = boundEventHandler.t;
    f.call(t, e, t);
  }
});

TemplateTwoWayBinding.attach = function(templateName) {
  // Template reference
  var template = Template[templateName];
  // Add rendered callback
  template.onRendered(function() {
    var t = this;
    // Loop through all variables we want to bind
    var elements = t.$('[value-bind]:not([bound-id])');
    // If our bound Session variable changes, update the corresponding element in the DOM
    elements.each(function() {
      var $element = $(this);
      // Set one time bound-id
      $element.attr('bound-id', ++boundId);
      var variableArray = $element.attr('value-bind').split('|');
      var variable = variableArray[0];
      var exec = variableArray[1];
      var wrappedEventHandler;
      if (exec && ['throttle', 'debounce'].indexOf(exec.slice(0, 8)) != -1) {
        execArray = exec.split(':');
        wait = parseInt(execArray[1], 10) || 200;
        exec = execArray[0];
        wrappedEventHandler = _[exec](eventHandler, wait);
      } else {
        wrappedEventHandler = eventHandler;
      }
      // Set events and context by bound-id
      boundMap[boundId] = { f: wrappedEventHandler, t: t };
      t.autorun(function() {
        var value = TemplateTwoWayBinding.getter.call(t, variable);
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
      });
    });
  });
};
