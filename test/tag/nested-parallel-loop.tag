<nested-parallel-loop>
    <nested-parallel-loop-group each="{ items }" data="{ this }"></nested-parallel-loop-group>

    <script>
        this.items = opts.items;
    </script>
</nested-parallel-loop>

<nested-parallel-loop-group>
    <div>
        <nested-parallel-loop-simple each="{ items }" data="{ this }" if={ !this.accountBased }></nested-parallel-loop-simple>
        <nested-parallel-loop-account-based each="{ items }" data="{ this }" if={ this.accountBased }></nested-parallel-loop-account-based>
    </div>

    <script>
        this.items = opts.data.items;
    </script>
</nested-parallel-loop-group>

<nested-parallel-loop-simple>
    <div>
        <input name="channel-value" type="text" onchange={changeValue} value={opts.data.value}>
        <button name="del" type="button" onclick={removeNotification}>Delete</button>
    </div>

    <script>

        this.removeNotification = function(e) {
            var item = e.item;
            this.items.splice(this.items.indexOf(item), 1);
        }.bind(this);
    </script>
</nested-parallel-loop-simple>

<nested-parallel-loop-account-based>
    <div>Account based</div>
</nested-parallel-loop-account-based>

