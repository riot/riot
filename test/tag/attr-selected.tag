<attr-selected>
  <select>
    <option value="0" __selected="{selected % 3 == 0}">0</option>
    <option value="1" __selected="{selected % 3 == 1}">1</option>
    <option value="2" __selected="{selected % 3 == 2}">2</option>
  </select>
  
  <button onclick={selectNext}>Select next</button>
  
  <script>
    this.selected = 0
  
    this.selectNext = function() {
      this.selected++
    }.bind(this)
  </script>
</attr-selected>
