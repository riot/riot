<bug-2229>
  <div>
    <select if={ flag }>
      <option each={ list } value={ value }>{ text }</option>
    </select>
  </div>
  <script>
    this.flag = true
    this.list = [{ value: 1, text: 'One' }, { value: 2, text: 'Two' }];
  </script>
</bug-2229>