
function ScreepsConsole (config) {
  this.messages_url = '/console_messages.json'
}

ScreepsConsole.prototype.poll = function (opts = {}) {
  var that = this
  var data = {}
  if(!opts.start_at) {
    if(!!this.start_at) {
      start_at = this.start_at
    } else {
      start_at = 'now-1m'
    }
  }

  $.ajax({
      url: this.messages_url,
      type: "GET",
      data: {
        start_at: start_at
      },
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
