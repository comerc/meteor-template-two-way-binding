comerc:template-two-way-binding
===============================

Two-Way Binding for Blaze templates. Simple!

Key features:
- value-bind declared in HTML-source - important for debug of alien code
- customizing (reactive) data-store: Session variables, [TemplateController](https://github.com/meteor-space/template-controller) state etc.
- extensible for external data validation: [SimpleSchema](https://github.com/aldeed/meteor-simple-schema), [Astronomy](https://github.com/jagi/meteor-astronomy) etc.

Inspired by: [Aurelia](http://aurelia.io/), [Vue](https://vuejs.org/guide/#Two-way-Binding), [ReactLink](https://facebook.github.io/react/docs/two-way-binding-helpers.html), [manuel:viewmodel](https://github.com/ManuelDeLeon/viewmodel) and [nov1n:reactive-bind](https://github.com/nov1n/reactive-bind).


## Installation

In a Meteor app directory, enter:

```bash
$ meteor add comerc:template-two-way-binding
```

## Usage
Add value-bind="foo" to an input element to bind it to a Session variable named "foo".

## Demo

[Demo here!](https://github.com/comerc/meteor-template-controller-demo)

## Example

Binds the Session variable "exampleVariable1" to the input element in the DOM. Any changes to the text field will be reflected
by the Session variable and vice versa.

```HTML
<template name="hello">
  <input type="text" value-bind="exampleVariable1"/>
</template>
```

```javascript
Template.hello.rendered = TemplateTwoWayBinding.rendered;
// or
// Template.hello.onRendered(function() {
//   TemplateTwoWayBinding.rendered.call(this);
// });
```
Or with [space:template-controller](https://github.com/meteor-space/template-controller) via `this.state`:

```javascript
TemplateTwoWayBinding.getter = function(variable) {
  // this - Template.instance()
  return this.state[variable]();
};

TemplateTwoWayBinding.setter = function(variable, value) {
  // best place for external data validation (SimpleSchema, Astronomy etc.)
  this.state[variable](value);
};

TemplateController('hello', {
  onRendered: TemplateTwoWayBinding.rendered,
  // or
  // onRendered() {
  //   TemplateTwoWayBinding.rendered.call(this);
  // },
  state: {
    exampleVariable1: 'test'
  }
});
```

## Supported elements
### Text
```HTML
<input type="text" value-bind="exampleVariable2"/>
```

The value stored in the Session variable is the text as String.

### Password
```HTML
<input type="password" value-bind="exampleVariable3"/>
```

The value stored in the Session variable is the text as String.

### Number
```HTML
<input type="number" value-bind="exampleVariable4"/>
```

The value stored in the Session variable is number as Number.

### Textarea
```HTML
<textarea name="area" value-bind="exampleVariable5"></textarea>
```

The value stored in the Session variable is the text as tring.

### Radio button(s)
```HTML
<input type="radio" name="color" value="Red" value-bind="exampleVariable6"/> Red
<input type="radio" name="color" value="Blue" value-bind="exampleVariable6"/> Blue
<input type="radio" name="color" value="Green" value-bind="exampleVariable6"/> Green
```

The value stored in the Session variable is the input value as String.

### Date
```HTML
<input type="date" value-bind="exampleVariable7"/>
```

The value stored in the Session variable is a Date object.

### Checkbox(es)
```HTML
<input type="checkbox" name="vehicle" value="Bike" value-bind="exampleVariable8"/> Bike
<input type="checkbox" name="vehicle" value="Car" value-bind="exampleVariable8"/> Car
<input type="checkbox" name="vehicle" value="Plane" value-bind="exampleVariable8"/> Plane
```

The value stored in the Session variable is the input value as String. When more than one checkbox is checked, it becomes an array of Strings.

### Range
```HTML
<input type="range" value-bind="exampleVariable9"/>
```

The value stored in the Session variable is the text as Number.

### Color picker
```HTML
<input type="color" value-bind="exampleVariable10"/>
```

The value stored in the Session variable is the color as hex triplet String (e.g. "#FFFFFF").

### [contenteditable]
```HTML
<div contenteditable="true" value-bind="exampleVariable11"></div>
```

XXX tested with [yabwe/medium-editor](https://github.com/yabwe/medium-editor)

## Throttle

By default throttle will only allow updates every 200ms. You can customize the rate of course. Here are a few examples.

Updating a property, at most, every 200ms
```HTML
<input type="text" value-bind="query|throttle">
```

Updating a property, at most, every 850ms
```HTML
<input type="text" value-bind="query|throttle:850">
```

## Debounce

Debounce prevents the binding from being updated until a specified interval has passed without any changes.

A common use case is a search input that triggers searching automatically. You wouldn't want to make a search API on every change (every keystroke). It's more efficient to wait until the user has paused typing to invoke the search logic.

Update after typing stopped for 200ms
```HTML
<input type="text" value-bind="query|debounce">
```

Update after typing stopped for 850ms
```HTML
<input type="text" value-bind="query|debounce:850">
```

## TODO

- [x] throttle & debounce  
- [x] [contenteditable]
- [x] modelMap & validation example
- [ ] support onChange for `<select>`
- [ ] w/o jQuery
- [ ] custom binding

## License
The code is licensed under the MIT License (see LICENSE file).
