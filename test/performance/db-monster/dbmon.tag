<dbmon>
  <div>
    <table class="table table-striped latest-data">
      <tbody>
        <!-- Database -->
        <tr each={ databasesArray }>
          <td class="dbname">
            { dbname }
          </td>
          <!-- Sample -->
          <td class="query-count">
            <span class={ lastSample.countClassName }>
              { lastSample.nbQueries }
            </span>
          </td>
          <!-- Query -->
          <td each={ lastSample.topFiveQueries } class={ elapsedClassName }>
            { formatElapsed }
            <div class="popover left">
              <div class="popover-content">
                { query }
              </div>
              <div class="arrow"></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <script>

    this.databasesArray = []

    loadSamples() {
      this.databasesArray = ENV.generateData().toArray()
      this.update()
      Monitoring.renderRate.ping()
      setTimeout(this.loadSamples, ENV.timeout)
    }

    this.loadSamples()

  </script>
</dbmon>