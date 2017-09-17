
function ScreepsConsole (config) {
  this.messages_url = '/console_messages.json'
}

ScreepsConsole.prototype.poll = function (opts = {}) {
  var that = this
  var data = {}
  var query_data = {}
  if(!opts.start_at) {
    if(!!this.start_at) {
      query_data['start_at'] = this.start_at
    } else {
      query_data['start_at'] = 'now-1m'
    }
  }
  if(!!opts.query) {
    query_data['query'] = opts.query
  }
  $.ajax({
      url: this.messages_url,
      type: "GET",
      data: query_data,
      success: function(data) {
        for (var message of data) {
          that.start_at = message['timestamp']
          if(!!opts.on_message) {
            opts.on_message(message)
          }
        }
        if(!!opts.on_finish) {
          opts.on_finish()
        }
      },
      dataType: "json",
      timeout: !!opts.timeout ? opts.timeout : 1000
  })
}
