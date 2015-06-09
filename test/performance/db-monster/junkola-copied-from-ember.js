function getDatabases() {
  var newData = getData();
  var databaseArray = [];

  Object.keys(newData.databases).forEach(function(dbname) {
    var sampleInfo = newData.databases[dbname];

    if (!model.databases[dbname]) {
      model.databases[dbname] = {
        name: dbname,
        samples: []
      };
    }

    var samples = model.databases[dbname].samples;
    samples.push({
      time: newData.start_at,
      queries: sampleInfo.queries
    });
    if (samples.length > 5) {
      samples.splice(0, samples.length - 5);
    }

    databaseArray.push(model.databases[dbname]);
  });

  _.each(databaseArray, function(db) {

    db.queries = db.samples[db.samples.length - 1].queries;
    db.countClassName = countClassName(db.queries);
    db.topFiveQueries = db.queries.slice(0, 5);
    while (db.topFiveQueries.length < 5) {
      db.topFiveQueries.push({ query: "" });
    }
    db.topFiveQueries = _.map(db.topFiveQueries, function(query, index) {
      return {
        key: index+'',
        query: query.query,
        elapsed: query.elapsed ? formatElapsed(query.elapsed) : '',
        className: elapsedClass(query.elapsed)
      };
    });
  });

  return databaseArray;

}

function getData() {
  // generate some dummy data
  var data = {
    start_at: new Date().getTime() / 1000,
    databases: {}
  };

  for (var i = 1; i <= ROWS; i++) {
    data.databases["cluster" + i] = {
      queries: []
    };

    data.databases["cluster" + i + "slave"] = {
      queries: []
    };
  }

  Object.keys(data.databases).forEach(function(dbname) {
    var info = data.databases[dbname];

    var r = Math.floor((Math.random() * 10) + 1);
    for (var i = 0; i < r; i++) {
      var q = {
        canvas_action: null,
        canvas_context_id: null,
        canvas_controller: null,
        canvas_hostname: null,
        canvas_job_tag: null,
        canvas_pid: null,
        elapsed: Math.random() * 15,
        query: "SELECT blah FROM something",
        waiting: Math.random() < 0.5
      };

      if (Math.random() < 0.2) {
        q.query = "<IDLE> in transaction";
      }

      if (Math.random() < 0.1) {
        q.query = "vacuum";
      }

      info.queries.push(q);
    }

    info.queries = info.queries.sort(function(a, b) {
      return b.elapsed - a.elapsed;
    });
  });

  return data;
}

var model = {
  databases: {}
};

var _base;

(_base = String.prototype).lpad || (_base.lpad = function(padding, toLength) {
  return padding.repeat((toLength - this.length) / padding.length).concat(this);
});

function countClassName(queries) {
  var countClassName = "label";

  if (queries.length >= 20) {
    countClassName += " label-important";
  } else if (queries.length >= 10) {
    countClassName += " label-warning";
  } else {
    countClassName += " label-success";
  }

  return countClassName;
}

function elapsedClass(elapsed) {
  if (elapsed >= 10.0) {
    return "elapsed warn_long";
  } else if (elapsed >= 1.0) {
    return "elapsed warn";
  } else {
    return "elapsed short";
  }
}

function formatElapsed(value) {
  var str = parseFloat(value).toFixed(2);
  if (value > 60) {
    var minutes = Math.floor(value / 60);
    var comps = (value % 60).toFixed(2).split('.');
    var seconds = comps[0].lpad('0', 2);
    var ms = comps[1];
    str = minutes + ":" + seconds + "." + ms;
  }
  return str;
}