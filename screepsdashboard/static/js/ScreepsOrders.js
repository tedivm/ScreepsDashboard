
function getOrders (opts = {}) {
  var url = '/orders.json'
  $.ajax({
      url: url,
      type: "GET",
      success: opts.success,
      dataType: "json",
      timeout: !!opts.timeout ? opts.timeout : 1000
  })
}