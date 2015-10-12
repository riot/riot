<loop-double-curly-brackets-child>
  <p>{{opts.data}}</p>
  <p>{{parent.data}}</p>
</loop-double-curly-brackets-child>

<loop-double-curly-brackets>
  <loop-double-curly-brackets-child data={{data}}></loop-double-curly-brackets-child>

  this.data = 'hello';

  change() {
    this.data += ' world';
    this.update()
  }

</loop-double-curly-brackets>