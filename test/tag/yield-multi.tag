<yield-multi>
  <p>yield the <yield from="content" /> here</p>
  <div>
     <p>yield the nested <yield from="nested-content" /> here</p>
     <p>do not yield the unreference content <yield from="unreferenced-content" />here</p>
  </div>
</yield-multi>
