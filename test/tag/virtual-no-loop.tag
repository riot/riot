<virtual-no-loop>

  <virtual if={true} riot-tag="vtest-tag" msg="if works {attr}">yielded text</virtual>

  <virtual riot-tag="vtest-tag" msg="virtuals yields expression">{parent.message}</virtual>

  <virtual if={false} riot-tag="vtest-tag" msg={attr}>{ parent.message }</virtual>


  this.message = 'hello there'
  this.attr = 'text'

</virtual-no-loop>

<vtest-tag>
  <span>{opts.msg}</span>
  <div><yield></yield></div>
</vtest-tag>
