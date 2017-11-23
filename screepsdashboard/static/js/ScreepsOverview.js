
function getOverview (name, interval, opts = {}) {
  var url = `/rooms/overview_${name}_${interval}.json`
  $.ajax({
      url: url,
      type: "GET",
      success: opts.success,
      dataType: "json",
      timeout: !!opts.timeout ? opts.timeout : 1000
  })
}
