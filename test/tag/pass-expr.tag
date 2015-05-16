
<expr-parent>
  <expr-child code={ code }></expr-child>
  this.code = 'foo { bar }'
</expr-parent>

<expr-child>
  <pre>{ opts.code } == foo \{ bar \}</pre>
  if (console)
    console.info(opts)
</expr-child>
