<conditional-tag>
    <p>Conditional Tag</p>

    this.on('mount', function() {
        console.log("Conditional tag mounted!");
    });
    this.on('mount', function() {
        console.log("Conditional tag mounted!");
    });

</conditional-tag>

<if-mount>

  <div if={ condition }>
    <conditional-tag></conditional-tag>
  </div>

  <a href="" onclick="{toggleCondition}">Toggle Condition</a>

  console.log("If-mount test");
  this.condition = false;
  this.test = true;

  var self = this;
  this.on('mount', function() {
      console.log("if-mount tag mounted!");
  });

  this.toggleCondition = function() {
    self.condition = !self.condition;
    self.update();
  }

</if-mount>
