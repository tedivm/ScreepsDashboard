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
    if(!message['tick']) {
      message['tick'] = '-'
      var rowClass = ''
    } else {
      var rowClass = message['tick'] % 2 == 0 ? ' even' : ' odd'
    }
    if(!message['group']) {
      message['group'] = '-'
    }

    var message_html = '<div class="columns small-1">' + message['tick'] + '</div>'
    message_html += '<div class="columns small-1">' + message['group'] + '</div>'
    message_html += '<div class="columns small-10">' + message['message'].replace(/(?:\r\n|\r|\n)/g, '<br />'); + '</div>'
    $('#console_box').append('<div class="row slog ' + severityClass + rowClass + '">' + message_html + '</div>')
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
            'shard': activeShard,
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

function startScreepsWallet () {
  loadScreepsWalletPage(0)
}

function loadScreepsWalletPage (page) {
  console.log('load screeps wallet page ' + page)
  getWalletPage({
    'page': page,
    'success': function (data) {
      $('#wallet_list tr').remove()
      if(!data['list']) {
        return
      }

      var table_contents = ''

      table_contents += '<thead>\n'
      table_contents += '  <tr>\n'


      table_contents += '    <th>\n'
      table_contents += '      Date\n'
      table_contents += '    </th>\n'

      table_contents += '    <th>\n'
      table_contents += '      Shard\n'
      table_contents += '    </th>\n'

      table_contents += '    <th>\n'
      table_contents += '      Tick\n'
      table_contents += '    </th>\n'

      table_contents += '    <th>\n'
      table_contents += '      Description\n'
      table_contents += '    </th>\n'

      table_contents += '    <th>\n'
      table_contents += '      Change\n'
      table_contents += '    </th>\n'

      table_contents += '    <th>\n'
      table_contents += '      Balance\n'
      table_contents += '    </th>\n'



      table_contents += '  </tr>\n'
      table_contents += '</thead>\n'

      table_contents += '<tbody>\n'

      for (var line of data['list']) {
        table_contents += '<tr>'
        table_contents += '  <td>' + line['date'] + '</td>\n'
        table_contents += '  <td>' + line['shard'] + '</td>\n'
        table_contents += '  <td>' + line['tick'] + '</td>\n'

        switch (line['type']) {
          case 'market.buy':
            table_contents += '  <td>Bought ' + line['market']['resourceType'] + ' from ' + '<a href="https://screeps.com/a/#!/room/' + line['shard'] + '/' + line['market']['targetRoomName'] + '" target="_blank">' + line['market']['targetRoomName'] + '</a>' + '</td>\n'
            break;
          case 'market.sell':
            table_contents += '  <td>Sold ' + line['market']['resourceType'] + ' to ' + '<a href="https://screeps.com/a/#!/room/' + line['shard'] + '/' + line['market']['targetRoomName'] + '" target="_blank">' + line['market']['targetRoomName'] + '</a>' + '</td>\n'
            break;
          case 'market.fee':
            if(line['market']['order']) {
              table_contents += '  <td>Market Fee - Create order to ' + line['market']['order']['type'] + ' ' + line['market']['order']['totalAmount'] + ' ' + line['market']['order']['resourceType'] + ' at ' + line['market']['order']['price'] + ' in ' + '<a href="https://screeps.com/a/#!/room/' + line['shard'] + '/' + line['market']['order']['roomName'] + '" target="_blank">' + line['market']['order']['roomName'] + '</a>' + '</td>\n'
            } else if(line['market']['extendOrder']) {
              table_contents += '  <td>Market Fee - Extend order ' + line['market']['extendOrder']['orderId'] + ' by ' + line['market']['extendOrder']['addAmount'] + '</td>\n'
            } else {
              table_contents += '  <td>Market Fee</td>\n'
            }
            break;
          default:
            table_contents += '  <td></td>\n'
            break;
        }

        table_contents += '  <td class="currency">' + line['change'].toFixed(2) + '</td>\n'
        table_contents += '  <td class="currency">' + line['balance'].toFixed(2) + '</td>\n'
        table_contents += '</tr>'
      }
      table_contents += '</tbody>\n'
      $('#wallet_list').append(table_contents)
      $('#wallet_list').data('page', data['page'])

      $('#wallet_nav').empty()
      if(data['page'] > 0) {
        $('#wallet_nav').append('<div id="wallet_nav_newer" class="column small-2 paginate newer"><a href="#" class="button">Newer</a></div>')
        $('#wallet_nav_newer').one('click', function (data) {
          loadScreepsWalletPage($('#wallet_list').data('page')-1)
        })
      }
      if(data['hasMore']) {
        $('#wallet_nav').append('<div id="wallet_nav_older" class="column small-2 paginate older"><a href="#" class="button">Older<a/></div>')
        $('#wallet_nav_older').one('click', function (data) {
          loadScreepsWalletPage($('#wallet_list').data('page')+1)
        })
      }
    }
  })
}

function startScreepsSegments () {
  loadScreepsSegment()
  $('.shard_selection').click(function(event){
    $('#shard_selector').data('activeShard', $(this).data('shard'))
    $('.shard_selection').removeClass('primary').addClass('secondary')
    $(this).removeClass('secondary').addClass('primary')
    loadScreepsSegment()
  })
  $('#segment_selector').change(function(){
    loadScreepsSegment()
  })
}

function loadScreepsSegment() {

  var activeShard = $('#shard_selector').data('activeShard')
  if(!activeShard) {
    activeShard = 'shard0'
  }
  var segment = $('#segment_selector').find(":selected").text();
  console.log('attempting to load segment ' + segment + ' from ' + activeShard)
  var url = 'segments/' + activeShard + '/' + segment + '.json'
  $.ajax({
      url: url,
      type: "GET",
      success: function (data) {
        $('#segment_text').val(data)
      },
      dataType: "json",
      timeout: 10000
  })


}