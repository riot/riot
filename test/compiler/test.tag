<treeitems>
  <treeitem>

    <div class={ bold: isFolder() } onclick={ toggle } ondblclick={ changeType }>
      { name }
      <span if={ isFolder() }>[{open ? '-' : '+'}]</span>
    </div>

    <ul if={ isFolder() } show={ isFolder() && open }>
      <li each={ child, i in nodes }>
        <treeitem data={child}/>
      </li>
      <li onclick={ addChild }>+</li>
    </ul>

    <script>      /* NOTE: this script works here, in the scope of treeitems */
    var self = this
    </script>

  </treeitem>
</treeitems>
