<bug-2629>
  <select data-ref="option" ><option each="{ opt in options }" value="{ opt.val }">{ opt.text }</option></select>
  <input data-ref="check" type="checkbox" each="{ opt in options }" value="{ opt.val }">
  <input data-ref="radio" type="radio" name="itm" each="{ opt in options }" value="{ opt.val }">

  <script>
    this.options = [
      { val:'R',  text:'Road'},
      { val:'',   text:'All '}
    ];
  </script>
</bug-2629>
