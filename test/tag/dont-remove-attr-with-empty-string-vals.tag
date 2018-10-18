<the-tag>
  <select data-ref="option" ><option each="{ opt in options }" value="{ opt.val }">{ opt.text }</option></select>
  <input data-ref="check" type="checkbox" each="{ opt in options }" value="{ opt.val }" onclick="{noop}">
  <input data-ref="radio" type="radio" name="itm" each="{ opt in options }" value="{ opt.val }" onclick="{noop}">

  <script>
    this.options = [
      { val:'H',  text:'Home'},
      { val:'R',  text:'Road'},
      { val:'',   text:'All Locations'}
    ];

    this.noop = (e) => {}
  </script>
</the-tag>
