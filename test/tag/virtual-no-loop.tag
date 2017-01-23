<virtual-no-loop>

  <virtual if={true} data-is="vtest-tag" msg="if works {attr}">yielded text</virtual>

  <virtual data-is="vtest-tag" msg="virtuals yields expression">{parent.message}</virtual>

  <virtual if={false} data-is="vtest-tag" msg={attr}>{ parent.message }</virtual>

  <virtual if={true}><p>{attr}</p></virtual>

  this.message = 'hello there'
  this.attr = 'text'

</virtual-no-loop>

<vtest-tag>
  <span>{opts.msg}</span>
  <div><yield></yield></div>
</vtest-tag>
