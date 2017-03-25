<nested-ref>
    <nested-ref-sub>
        <input ref="greeting1" type="text" value="Hello1">
    </nested-ref-sub>
    <nested-ref-sub>
        <nested-ref-sub>
            <input data-ref="greeting2" type="text" value="Hello2">
        </nested-ref-sub>
    </nested-ref-sub>
</nested-ref>

<nested-ref-sub>
    <yield/>
</nested-ref-sub>
