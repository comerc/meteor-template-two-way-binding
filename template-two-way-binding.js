TemplateTwoWayBinding = {};

// for custom override
TemplateTwoWayBinding.getter = function(variable) {
  // this - templateInstance context
  return Session.get(variable);
};

// for custom override
TemplateTwoWayBinding.setter = function(variable, value) {
  // this - templateInstance context
  Session.set(variable, value);
};

// for custom override
// TemplateTwoWayBinding.operator = function(variable, operator, params) {
//   // this - templateInstance context
//   // for custom code
// };

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
      var type = $element.attr('type');
      // Update the Session variable depending on the type of input element
      switch (type) {
        case 'checkbox':
          if ($element.attr('value')) {
            var checked = $element.prop('checked');
            var prevValue = TemplateTwoWayBinding.getter.call(t, variable);
            if (prevValue) {
              // Create an array to generalize processing
              if(!_.isArray(prevValue)) {
                  prevValue = [prevValue];
              }
              if (checked) {
                // Add the newly checked element to the array
                if (prevValue.indexOf(value) === -1) {
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
          } else {
            value = $element.prop('checked');
          }
          break;
        case 'radio':
          value = $element.prop('checked') ? value : undefined;
          break;
        case 'range': // Fall through
        case 'number':
          var intValue = parseInt(value, 10);
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
      }
    });
    var type = $element.attr('type');
    var events;
    switch (type) {
      case 'checkbox':
        events = 'change';
        break;
      case 'radio':
        events = 'change';
        break;
      case 'range':
        // Drag event for input[type='range'] IE support
        events = 'input drag';
        break;
      default:
        events = 'input';
    }
    $element.on(events + ' [bound-id=' + boundId + ']', boundEventHandler);
    t.autorun(function() {
      var value = TemplateTwoWayBinding.getter.call(t, variable, $element);
      if ($element.attr('is-setter')) {
        $element.removeAttr('is-setter');
        return;
      }
      if ($element.is('[contenteditable]')) {
        $element.html(value);
      } else {
        var type = $element.attr('type');
        if (type === 'checkbox') {
          if ($element.attr('value')) {
            if (value !== undefined) {
              if (!_.isArray(value)) {
                value = new Array(value);
              }
              var hasValue = value.indexOf($element.val()) > -1;
              if (hasValue != $element.prop('checked')) {
                $element.trigger('click');
              }
            }
          } else {
            if (value != $element.prop('checked')) {
              $element.trigger('click');
            }
          }
        } else if (type === 'radio') {
          if (value !== undefined) {
            if (!_.isArray(value)) {
              value = new Array(value);
            }
            if (value.indexOf($element.val()) > -1) { // coffee: if ~value.indexOf $element.val()
              $element.trigger('click');
            }
          }
        } else {
          // Format date object to match input[type='date'] format
          if (type === 'date' && value instanceof Date) {
            value = (new Date).toDateInputValue();
          }
          // In this case we copy the Session variable to the value property
          $element.val(value);
        }
      }
    });
  });
};
