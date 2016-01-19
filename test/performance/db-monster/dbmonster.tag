<dbmonster>
  <table class="table table-striped latest-data">
    <tbody>
      <tr each={ dbs } no-reorder>

        <td class="dbname">
          { name }
        </td>

        <td class="query-count">
          <span class="{ countClassName }">
            { queries.length }
          </span>
        </td>

        <td each={ topFiveQueries } no-reorder class="Query { className }">
          { elapsed }
          <div class="popover left">
            <div class="popover-content">{ query }</div>
            <div class="arrow"></div>
          </div>
        </td>

      </tr>
    </tbody>
  </table>

  this.dbs = opts.dbs;
  var that = this;

  function redraw() {
    that.dbs = getDatabases();
    that.update();
    setTimeout(redraw, TIMEOUT);
  }
  redraw();

</dbmonster>
