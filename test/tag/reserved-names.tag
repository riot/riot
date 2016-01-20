<reserved-names>
    <p>Looping over an array containing objects w/ reserved property names</p>
    <ul each={items}>
        <li>{name}: {String(tags)}</li>
    </ul>
    <button onclick={reorder}>Reorder</button>
    <script>
        this.items = [
            {name: "item 1", tags: null},
            {name: "item 2", tags: ["a", "b", "c"]},
            {name: "item3"}
        ]

        reorder() {
            this.items.reverse()
        }
    </script>
</reserved-names>