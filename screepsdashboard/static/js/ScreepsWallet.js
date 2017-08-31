
function getWalletPage (opts = {}) {
  if(!opts.page) {
    opts.page = 0
  }
  var url = '/wallet/' + opts.page + '.json'
  $.ajax({
      url: url,
      type: "GET",
      success: opts.success,
      dataType: "json",
      timeout: !!opts.timeout ? opts.timeout : 1000
  })
}