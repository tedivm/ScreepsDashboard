
function ScreepsMemory (config) {
  this.messages_url = '/memory.json'
}

ScreepsMemory.prototype.getMemoryKeys = function (opts = {}) {
  var that = this

  if(!opts.shard) {
    opts.shard = 'shard0'
  }

  var url = '/memory/keys/' + opts.shard + '.json'

  $.ajax({
      url: url,
      type: "GET",
      success: opts.success,
      dataType: "json",
      timeout: !!opts.timeout ? opts.timeout : 10000
  })
}


ScreepsMemory.prototype.getMemoryMeta = function (opts = {}) {
  var that = this

  if(!opts.shard) {
    opts.shard = 'shard0'
  }

  var url = '/memory/meta/' + opts.shard + '.json'

  $.ajax({
      url: url,
      type: "GET",
      success: opts.success,
      dataType: "json",
      timeout: !!opts.timeout ? opts.timeout : 10000
  })
}

ScreepsMemory.prototype.getMemory = function (opts = {}) {
  var that = this

  if(!opts.shard) {
    opts.shard = 'shard0'
  }

  var url = '/memory/' + opts.shard + '.json'
  if(!!opts.key) {
    url += '?path=' + opts.key
  }

  $.ajax({
      url: url,
      type: "GET",
      success: opts.success,
      dataType: "json",
      timeout: !!opts.timeout ? opts.timeout : 10000
  })
}
