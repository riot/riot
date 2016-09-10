<loop-bug-1649>
  <h3>Folders</h3>
  <div>
    <div ref='folder-link-1' onclick={ switchFolder1 }>Folder1</div>
    <div ref='folder-link-2' onclick={ switchFolder2 }>Folder2</div>
  </div>
  <div>
    <div class='list' each={ folder } if={ !removed }>
      <div>{ name }</div>
      <div class='remove' onclick={ parent.remove }>Remove</div>
    </div>
  </div>
  <script>
    function item(name) {
      return { name: name }
    }
    var folder1 = [ item('file1InFolder1'), item('file2InFolder1') ]
    var folder2 = [ item('file1InFolder2'), item('file2InFolder2') ]
    this.folder = folder1
    switchFolder1() {
      this.update({ folder: folder1 })
    }
    switchFolder2() {
      this.update({ folder: folder2 })
    }
    remove(e) {
      var item = e.item
      item.removed = true
      this.update()
    }
  </script>
</loop-bug-1649>