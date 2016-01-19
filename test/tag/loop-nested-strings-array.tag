<loop-nested-strings-array>
    <loop-nested-strings-array-list each={item in data}></loop-nested-strings-array-list>
    this.data = [
        {array: ['a', 'b']},
        {array: ['c', 'd']}
    ];
</loop-nested-strings-array>

<loop-nested-strings-array-list>
    <loop-nested-strings-array-item each={item in item.array}></loop-nested-strings-array-item>
</loop-nested-strings-array-list>

<loop-nested-strings-array-item onclick={ clicked }>
    <p>{item}</p>
    this.clicked = function(evt){
        this.parent.item.array.reverse()
    }
</loop-nested-strings-array-item>