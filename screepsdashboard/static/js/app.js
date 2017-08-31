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
  $('#shard_selection_shard0').removeClass('secondary').addClass('primary')
  loadScreepsMemory()
  $('.shard_selection').click(function(event){
    $('#shard_selector').data('activeShard', $(this).data('shard'))
    $('.shard_selection').removeClass('primary').addClass('secondary')
    $(this).removeClass('secondary').addClass('primary')
    loadScreepsMemory()
  })
}

function loadScreepsMemory () {

  // Build out the table
  var screepsmemory = new ScreepsMemory()

  var activeShard = $('#shard_selector').data('activeShard')
  if(!activeShard) {
    activeShard = 'shard0'
  }

  screepsmemory.getMemoryMeta({
    'shard': activeShard,
    'success': function (data) {
      $('#memory_list tr').remove()

      var table_contents = ''

      table_contents += '<thead>\n'
      table_contents += '  <tr>\n'
      table_contents += '    <th>\n'
      table_contents += '      Key\n'
      table_contents += '    </th>\n'

      table_contents += '    <th>\n'
      table_contents += '      Size\n'
      table_contents += '    </th>\n'

      table_contents += '    <th>\n'
      table_contents += '      Data\n'
      table_contents += '    </th>\n'

      table_contents += '  </tr>\n'
      table_contents += '</thead>\n'
      table_contents += '<tbody>\n'

      for (var datum of data) {
        var key = datum['key']
        table_contents += '  <tr>\n'
        table_contents += '    <td id="memory_key_' + key + '" class="memorykey" data-memory-key="' + key + '">\n'
        table_contents += '    ' + key + '\n'
        table_contents += '    </td>\n'

        table_contents += '    <td id="memory_size_' + key + '" class="memorysize data-memory-key="' + key + '">\n'
        if(datum['size'] > 1024) {
          table_contents += '      ' + (datum['size'] / 1024).toFixed(0) + 'kb\n'
        } else {
          table_contents += '      ' + datum['size'] + '\n'
        }
        table_contents += '    </td>\n'

        if(datum['scalar']) {
          table_contents += '    <td id="memory_data_' + key + '" class="memorydata" data-memory-loaded=true data-memory-key="' + key + '">\n'
          table_contents += datum['data'] + '\n'
        } else {
          table_contents += '    <td id="memory_data_' + key + '" class="memorydata" data-memory-key="' + key + '">\n'
          table_contents += '      {...}\n'
        }
        table_contents += '    </td>\n'
        table_contents += '  </tr>\n'
      }

      table_contents += '</tbody>\n'
      $('#memory_list').append(table_contents)

      $('#memory_list td.memorydata').click(function (event) {
        if(!$(this).data('memoryLoaded')) {
          var table_element = $(this)
          screepsmemory.getMemory({
            'key': $(this).data('memoryKey'),
            'success': function (data) {
              table_element.data('memoryLoaded', true)
              table_element.JSONView(data, {collapsed: true})
            }
          })
        }
      })

    }
  })
}
