//src: scoped.tag
riot.tag2('scoped-tag', '<p>should have a border</p>', 'scoped-tag,[riot-tag="scoped-tag"] { background: red; } scoped-tag p,[riot-tag="scoped-tag"] p { border: solid 1px black }', '', function(opts) {
});