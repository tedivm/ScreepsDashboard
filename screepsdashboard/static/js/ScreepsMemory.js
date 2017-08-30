
ScreepsMemory (config) {
  this.messages_url = '/memory.json'
}

ScreepsMemory.prototype.load = function (opts = {}) {
  var that = this

  if(!opts.shard) {
    opts.shard = 'shard0'
  }

  var url = '/memory/' + opts.shard + '.json'

  $.ajax({
      url: url,
      type: "GET",
      success: opts.success,
      dataType: "json",
      timeout: !!opts.timeout ? opts.timeout : 10000
  })
}
