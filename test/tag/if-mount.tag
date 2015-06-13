<conditional-tag>
    <p>Conditional Tag</p>
</conditional-tag>

<if-mount2>
  <div if={ condition }>
    <conditional-tag></conditional-tag>
  </div>

  <a href="" onclick="{toggleCondition}">Toggle Condition</a>

  this.condition = false;
  this.test = true;

  var self = this;

  this.toggleCondition = function() {
    self.condition = !self.condition;
    self.update();
  }
</if-mount2>

<if-mount>
  <div if={ condition }>
    <if-mount2></if-mount2>
  </div>

  <a href="" onclick="{toggleCondition}">Toggle Condition</a>

  this.condition = false;
  this.test = true;

  var self = this;

  this.toggleCondition = function() {
    self.condition = !self.condition;
    self.update();
  }
</if-mount>
