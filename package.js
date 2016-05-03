Package.describe({
  name: 'comerc:template-two-way-binding',
  version: '1.3.3',
  summary: 'Two-Way Binding for Blaze templates',
  git: 'https://github.com/comerc/meteor-template-two-way-binding',
  documentation: 'README.md'
});

Package.onUse(function (api) {
  // Have to stay on Meteor 1.2.1 to be compatible with all Meteor versions.
  api.versionsFrom('1.3.2');
  api.use([
    'templating',
    'blaze-html-templates',
    'aldeed:template-extension@4.0.0', // TODO how to support METEOR@1.2.1
  ]);
  api.addFiles('template-two-way-binding.js', 'client');
  api.export('TemplateTwoWayBinding');
});
