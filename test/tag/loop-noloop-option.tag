<loop-noloop-option>
    <select>
        <option value="-1">x</option>
        <option value={row.id} each={row, index in list}>{row.name}</option>
        <option value="0">Other</option>
    </select>
    <script>
        this.list = [
            {id: 1, name: 'one'}
        ]
    </script>
</loop-noloop-option>