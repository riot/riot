<conditional-tag>
    <p>Conditional Tag</p>
</conditional-tag>

<if-level2>

  <a href="" onclick="{toggleCondition}">Toggle Condition (Level 2)</a>

  <conditional-tag if="{condition}"></conditional-tag>

  this.condition = (opts.condition == 'true')
  var self = this

  this.toggleCondition = function() {
    self.condition = !self.condition
    self.update()
  }
</if-level2>
<if-level1>

  <p><a href="" onclick="{toggleCondition}">Toggle Condition (Level 1)</a></p>

  <div if={ condition }>
    <if-level2 condition="{level2Condition}"></if-level2>
  </div>


  this.condition = (opts.condition == 'true')
  this.level2Condition = opts.level2

  var self = this

  this.toggleCondition = function() {
    self.condition = !self.condition
    self.update()
  }
</if-level1>

<if-mount>
    <if-level1 name="ff" condition="false" level2="false"></if-level1>
    <if-level1 name="ft" condition="false" level2="true"></if-level1>
    <if-level1 name="tf" condition="true" level2="false"></if-level1>
    <if-level1 name="tt" condition="true" level2="true"></if-level1>
</if-mount>

