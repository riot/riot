<loop-tag-instances>
  <loop-tag-instances-child each={ inst }>
    <p>Hello { this.tags['loop-tag-instance'][0].name }</p>
  </loop-tag-instances-child>

  <loop-tag-instances-test>
    <loop-tag-instance>
    </loop-tag-instance>
  </loop-tag-instances-test>

  <loop-tag-instances-test>
    <loop-tag-instance>
    </loop-tag-instance>
  </loop-tag-instances-test>

  <loop-tag-instances-test>
    <loop-tag-instance>
    </loop-tag-instance>
  </loop-tag-instances-test>

  <loop-tag-instances-test>
    <loop-tag-instance>
    </loop-tag-instance>
  </loop-tag-instances-test>

  <loop-tag-instances-test>
    <loop-tag-instance>
    </loop-tag-instance>
  </loop-tag-instances-test>

  this.inst = this.tags['loop-tag-instances-test']

</loop-tag-instances>

<loop-tag-instances-child>
</loop-tag-instances-child>

<loop-tag-instance>
  this.name = 'hello'
</loop-tag-instance>

<loop-tag-instances-test>
</loop-tag-instances-test>