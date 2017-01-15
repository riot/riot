<dynamic-nested>
  <div ref="dynamic" data-is="{ page }"></div>
  this.page = 'page-a'
</dynamic-nested>

<page>
	<h1>{ opts.title }</h1>
</page>
<page-a>
  <page title="{ title }">
  	<p>{ parent.content }</p>
  </page>
  this.title = 'page-a'
  this.content = 'in page-a'
</page-a>
<page-b>
  <page title="{ title }">
    <p>{ parent.content }</p>
  </page>
  this.title = 'page-b'
  this.content = 'in page-b'
</page-b>
