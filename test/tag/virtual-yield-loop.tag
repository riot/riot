<virtual-yield-loop>
    <virtual  riot-tag="virtual-yield-test" each={ item in items }>{ item.v }</virtual>

    this.items = [
        {v: 'one'},
        {v: 'two'},
        {v: 'three'}
    ]
</virtual-yield-loop>

<virtual-yield-test>
    <div>take up space</div>
    <span><yield></yield></span>
</virtual-yield-test>