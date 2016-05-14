comerc:template-two-way-binding
===============================

Two-Way Binding for Blaze templates. Simple! It's used by the [Template2](https://github.com/comerc/meteor-template2) package, but you can use it by itself, too.

Key features:
- value-bind declared in HTML-source - important for debug of alien code
- customizing (reactive) data-store: [Session variables](https://github.com/comerc/meteor-template-two-way-binding/blob/master/template-two-way-binding.js#L3-L13), [TemplateController state](https://github.com/comerc/meteor-template-controller-demo/blob/master/client/main.coffee#L8-L18) etc.
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

[Demo here!](https://github.com/comerc/meteor-template2#how-to-run-demo)

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
Template.hello.onRendered(function() {
  TemplateTwoWayBinding.rendered(this);
});
```
<!--Or with [space:template-controller](https://github.com/meteor-space/template-controller) via `this.state`:

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
  //   TemplateTwoWayBinding.rendered(this);
  // },
  state: {
    exampleVariable1: 'test'
  }
});
```-->

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

### Checkbox
```HTML
<input type="checkbox" value-bind="exampleVariable8"/> Bike
```

The value stored in the Session variable is Boolean.

### Checkboxes
```HTML
<input type="checkbox" name="vehicle" value="Bike" value-bind="exampleVariable9"/> Bike
<input type="checkbox" name="vehicle" value="Car" value-bind="exampleVariable9"/> Car
<input type="checkbox" name="vehicle" value="Plane" value-bind="exampleVariable9"/> Plane
```

The value stored in the Session variable is the input value as String. When more than one checkbox is checked, it becomes an array of Strings.

### Range
```HTML
<input type="range" value-bind="exampleVariable10"/>
```

The value stored in the Session variable is the text as Number.

### Color picker
```HTML
<input type="color" value-bind="exampleVariable11"/>
```

The value stored in the Session variable is the color as hex triplet String (e.g. "#FFFFFF").

### [contenteditable]
```HTML
<div contenteditable="true" value-bind="exampleVariable12"></div>
```

The value stored in the Session variable is the HTML-value as String.

XXX tested with [yabwe/medium-editor](https://github.com/yabwe/medium-editor)

## Throttle

By default throttle will only allow updates every 200ms. You can customize the rate of course. Here are a few examples.

By default, throttle will execute the function as soon as you call it for the first time, and, if you call it again any number of times during the wait period, as soon as that period is over. If you'd like to disable the leading-edge call, pass "noLeading", and if you'd like to disable the execution on the trailing-edge, pass "noTrailing".

Updating a property, at most, every 200ms
```HTML
<input type="text" value-bind="variable|throttle">
```

Updating a property, at most, every 850ms (and noLeading, and noTrailing)
```HTML
<input type="text" value-bind="variable|throttle:850:noLeading:noTrailing">
```

## Debounce

Debounce prevents the binding from being updated until a specified interval has passed without any changes.

A common use case is a search input that triggers searching automatically. You wouldn't want to make a search API on every change (every keystroke). It's more efficient to wait until the user has paused typing to invoke the search logic.

Pass param "immediate" to cause debounce to trigger the function on the leading instead of the trailing edge of the wait interval. Useful in circumstances like preventing accidental double-clicks on a "submit" button from firing a second time.

Update after typing stopped for 200ms
```HTML
<input type="text" value-bind="variable|debounce">
```

Update after typing stopped for 850ms (and immediate)
```HTML
<input type="text" value-bind="variable|debounce:850:immediate">
```

## TODO

- [x] throttle & debounce  
- [x] [contenteditable]
- [x] modelMap & validation examples: [one](https://github.com/comerc/meteor-template-controller-demo), [two](https://github.com/comerc/meteor-template2)
- [x] remove dependencies of Template.body.events & aldeed:template-extension
- [x] ~~custom operator~~
- [x] throttle:500:notLeading:notTrailing
- [x] debounce:500:immediate
- [ ] custom binding events via "|on:change" ("change" as [example](https://github.com/ManuelDeLeon/phonebook/blob/master/client/body/main/contacts/editContact/editContact.js#L13) for `<select>`)
- [ ] w/o jQuery
- [ ] How to implement external wrapping of events (like throttle & debounce)? I want to give up the pseudo coding, may be.
- [*] single ckeckbox as Boolean

## License
The code is licensed under the MIT License (see LICENSE file).
