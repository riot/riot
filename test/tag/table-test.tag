<!--
  The main container. It is not neccesary but holds common data and all the
  the tags, so the test only needs one call to mount("table-test") to work.
-->
<table-test>

  <table riot-tag="table-caption"
    header={ header }
    footer={ footer } rows={ rows } widths={ widths }/>

  <table riot-tag="table-colgroup"
    header={ header }
    footer={ footer } rows={ rows } widths={ widths }/>

  <table riot-tag="table-looped-col"
    header={ header }
    footer={ footer } rows={ rows } widths={ widths }/>

  <table riot-tag="table-multi-col"
    header={ header }
    footer={ footer } rows={ rows } widths={ widths }/>

  <table riot-tag="table-tfoot"
    header={ header }
    footer={ footer } rows={ rows } widths={ widths }/>

  <table riot-tag="table-tr-body-only"
    header={ header }
    footer={ footer } rows={ rows } widths={ widths }/>

  <table riot-tag="table-tr-alone"
    header={ header }
    footer={ footer } rows={ rows } widths={ widths }/>

  <table riot-tag="table-custom-thead-tfoot"
    header={ header }
    footer={ footer } rows={ rows } widths={ widths }/>

  <script>
  this.widths = [150, 200]
  this.header = ['H-1', 'H-2']
  this.footer = ['F-1', 'F-2']
  this.rows = [['R1-C1', 'R1-C2'], ['R2-C1', 'R2-C2']]
  </script>
</table-test>

<!-- The nested riot tags -->

<table-caption>
  <caption>Title</caption>
  <colgroup>
    <col each={ width in opts.widths } width="{ width }">
  </colgroup>
  <tbody>
    <tr each={ row in opts.rows }>
      <td each={ cell in row }>{ cell }</td>
    </tr>
  </tbody>
</table-caption>

<table-colgroup>
  <colgroup>
    <col each={ width in opts.widths } width="{ width }">
  </colgroup>
  <thead>
    <tr><th each={ cell in opts.header }>{ cell }</th></tr>
  </thead>
  <tbody>
    <tr each={ row in opts.rows }>
      <td each={ cell in row }>{ cell }</td>
    </tr>
  </tbody>
</table-colgroup>

<table-looped-col>
  <col each={ width in opts.widths } width="{ width }">
  <thead>
    <tr><th each={ cell in opts.header }>{ cell }</th></tr>
  </thead>
  <tbody>
    <tr each={ row in opts.rows }>
      <td each={ cell in row }>{ cell }</td>
    </tr>
  </tbody>
</table-looped-col>

<!-- table starting with a multiple cols, without colgroup -->
<table-multi-col>
  <col width="{ opts.widths[0] }">
  <col width="{ opts.widths[1] }">
  <thead>
    <tr><th each={ cell in opts.header }>{ cell }</th></tr>
  </thead>
  <tbody>
    <tr each={ row in opts.rows }>
      <td each={ cell in row }>{ cell }</td>
    </tr>
  </tbody>
</table-multi-col>

<!-- table starting with a tfoot -->
<table-tfoot>
  <tfoot>
    <tr><td each={ cell in opts.footer }>{ cell }</td></tr>
  </tfoot>
  <tbody>
    <tr each={ row in opts.rows }>
      <td each={ cell in row }>{ cell }</td>
    </tr>
  </tbody>
</table-tfoot>

<!-- table with a looped TR, without TBODY -->
<table-tr-body-only>
  <tr each={ row in opts.rows }>
    <td each={ cell in row }>{ cell }</td>
  </tr>
</table-tr-body-only>

<!-- table with single literal TR, without expressions -->
<table-tr-alone>
  <tr><td>R1-C1</td><td>R1-C2</td></tr>
</table-tr-alone>

<!-- table with all the main elements as riot tags (2 tbody) -->
<table-custom-thead-tfoot>
  <colgroup riot-tag="tag-colgroup" widths={ opts.widths }/>
  <thead riot-tag="tag-thead" rows={ opts.header }/>
  <tfoot riot-tag="tag-tfoot" rows={ opts.footer }/>
  <tbody riot-tag="tag-tbody" rows={ opts.rows }/>
  <tbody riot-tag="tag-tbody" rows={ opts.rows }/>
</table-custom-thead-tfoot>

<!-- riot tags for the main table elements -->
<tag-colgroup>
  <col each={ width in opts.widths } width={ width }>
</tag-colgroup>
<tag-thead>
  <tr><td each={ cell in opts.rows }>{ cell }</td></tr>
</tag-thead>
<tag-tfoot>
  <tr><td each={ cell in opts.rows }>{ cell }</td></tr>
</tag-tfoot>
<tag-tbody>
  <tr each={ row in opts.rows }>
    <td each={ cell in row }>{ cell }</td>
  </tr>
</tag-tbody>
