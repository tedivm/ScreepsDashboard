$(document).foundation()

const severity = {
  0: 'trace',
  1: 'debug',
  2: 'info',
  3: 'warn',
  4: 'error',
  5: 'fatal'
}

function startConsoleMirror () {
  function appendToConsole (message) {
    if(!message['severity']) {
      message['severity'] = 3
    }
    var severityClass = severity[message['severity']]
    $('#console_box').append('<div class="log ' + severityClass + '">' + message['message'] + '</div>')
  }

  function scrollToNewestConsoleMessage () {
    if(!$('#console_box').is(':hover')) {
      $('#console_box').animate({
        scrollTop: $('#console_box').prop('scrollHeight')
      }, 500)
    }
  }

  var screepsconsole = new ScreepsConsole({})
  screepsconsole.poll({
    on_message: appendToConsole,
    on_finish: scrollToNewestConsoleMessage,
    timeout: 1000
  })
  setInterval(function () {
    screepsconsole.poll({
      on_message: appendToConsole,
      on_finish: scrollToNewestConsoleMessage,
      timeout: 1000
    })
  }, 1500)
}

function startScreepsMemory () {
  function loadMemoryViewer (data) {
    $('#memory_json_viewer').JSONView(data, {collapsed: true})
  }

  var screepsmemory = new ScreepsMemory()
  screepsmemory.load({
    'success': loadMemoryViewer
  })

  // Add "shard" switch


}