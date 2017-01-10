<loop-bug-2205>
  <ul>
    <li ref="items" each="{ items }">{ name }</li>
  </ul>

  <script>

    generateInitial() {
      var i;
      var list = [];
      for (i = 0; i < this.itemsAmount; i++)
        list.push({ name: i });
      return list;
    }

    addEditList() {
      this.items.splice(2, 1);
      this.items.splice(4, 1);

      this.items.push({ name: "new" });
      this.items.push({ name: "new" });

      this.items.sort(function(a, b) {
        if (a.name < b.name) {
          return -1
        } else if (a.name > b.name) {
          return 1
        }
        return 0
      })
    }

    this.itemsAmount = 10
    this.items = this.generateInitial()

  </script>
</loop-bug-2205>