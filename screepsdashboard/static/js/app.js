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

    //console.log(Object.keys(message))

    var message_html = '<div class="columns small-1">' + message['tick'] + '</div>'
    message_html += '<div class="columns small-1">' + message['group'] + '</div>'
    message_html += '<div class="columns small-10">' + filterHtml(message) + '</div>'
    $('#console_box').append('<div class="row slog ' + severityClass + rowClass + '">' + message_html + '</div>')
  }

  function filterHtml (message) {
    if (!message['raw'].includes('font')) {
      return message['raw'].replace(/(?:\r\n|\r|\n)/g, '<br />')
    }

    var messageHtml = $(message['raw'].replace(/(?:\r\n|\r|\n)/g, '<br />'))
    messageHtml.unwrap()
    var messageText = messageHtml.html()
    if (messageText.startsWith(`${message['group']}: `)) {
      messageText = messageText.slice(message['group'].length + 2)
    }
    return messageText
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

  var consoleInterval = setInterval(function () {
    screepsconsole.poll({
      on_message: appendToConsole,
      on_finish: scrollToNewestConsoleMessage,
      timeout: 1000
    })
  }, 1500)


  $('#console_query').on('keyup', function (e) {
    if (e.keyCode == 13) {
      // Do something
      var query = $(this).val()
      clearInterval(consoleInterval)
      consoleInterval = setInterval(function () {
        screepsconsole.poll({
          query: query,
          on_message: appendToConsole,
          on_finish: scrollToNewestConsoleMessage,
          timeout: 1000
        })
      }, 1500)
    }
  })
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

      table_contents += '    <th class="currency">\n'
      table_contents += '      Change\n'
      table_contents += '    </th>\n'

      table_contents += '    <th class="currency">\n'
      table_contents += '      Balance\n'
      table_contents += '    </th>\n'



      table_contents += '  </tr>\n'
      table_contents += '</thead>\n'

      table_contents += '<tbody>\n'

      for (var line of data['list']) {
        table_contents += '<tr>'
        console.log(line['date'])
        var lineDate = new Date(line['date'])
        table_contents += '  <td>' + dateFormat(lineDate, 'mmmm dS, yyyy, H:MM:ss Z') + '</td>\n'
        table_contents += '  <td>' + line['shard'] + '</td>\n'
        table_contents += '  <td>' + line['tick'] + '</td>\n'

        var resourceLink = `<img src=https://s3.amazonaws.com/static.screeps.com/upload/mineral-icons/${line['market']['resourceType']}.png>`

        switch (line['type']) {
          case 'market.buy':
            table_contents += `<td><a href="https://screeps.com/a/#1/room/${line['shard']}/${line['market']['roomName']}" target="_blank">${line['market']['roomName']}</a> bought ${line['market']['amount']} ${line['market']['resourceType']} ${resourceLink} from <a href="https://screeps.com/a/#1/room/${line['shard']}/${line['market']['targetRoomName']}" target="_blank">${line['market']['targetRoomName']}</a> at ${line['market']['price']}</td>`
            break;
          case 'market.sell':
            table_contents += `<td><a href="https://screeps.com/a/#1/room/${line['shard']}/${line['market']['targetRoomName']}" target="_blank">${line['market']['targetRoomName']}</a> sold ${line['market']['amount']} ${line['market']['resourceType']} ${resourceLink} to <a href="https://screeps.com/a/#1/room/${line['shard']}/${line['market']['roomName']}" target="_blank">${line['market']['roomName']}</a> at ${line['market']['price']}</td>`
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

        var currencyOptions = {
          'minimumFractionDigits': 3,
          'maximumFractionDigits': 3
        }

        var changeClass = line['change'] > 0 ? 'positive' : 'negative'
        table_contents += `  <td class="number ${changeClass}">` + line['change'].toLocaleString(undefined, currencyOptions) + '</td>\n'
        table_contents += '  <td class="number">' + line['balance'].toLocaleString(undefined, currencyOptions) + '</td>\n'
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

function startScreepsOrders () {
  getOrders({
    'success': function (data) {
      console.log(data)
      var table_contents = ''

      table_contents += '<thead>\n'
      table_contents += '  <tr>\n'

      table_contents += '    <th class="created">\n'
      table_contents += '      Created\n'
      table_contents += '    </th>\n'

      table_contents += '    <th class="shard">\n'
      table_contents += '      Shard\n'
      table_contents += '    </th>\n'

      table_contents += '    <th class="room">\n'
      table_contents += '      Room\n'
      table_contents += '    </th>\n'

      table_contents += '    <th class="type">\n'
      table_contents += '      Type\n'
      table_contents += '    </th>\n'

      table_contents += '    <th class="resource">\n'
      table_contents += '      Resource\n'
      table_contents += '    </th>\n'

      table_contents += '    <th class="price">\n'
      table_contents += '      Price\n'
      table_contents += '    </th>\n'

      table_contents += '    <th class="remaining">\n'
      table_contents += '      Remaining\n'
      table_contents += '    </th>\n'

      table_contents += '    <th class="amount">\n'
      table_contents += '      Amount\n'
      table_contents += '    </th>\n'

      table_contents += '  </tr>\n'
      table_contents += '</thead>\n'

      table_contents += '<tbody>\n'

      for (var shard of Object.keys(data['shards'])) {
        for (var order of data['shards'][shard]) {
          console.log(`${order.created} ${order.active} ${order.type} ${order.amount} ${order.remainingAmount} ${order.resourceType} ${order.price} ${order.totalAmount} ${order.roomName}`)

          if (order.active) {
            table_contents += `  <tr class="active ${order.type} ${order.resourceType}">\n`
          } else {
            table_contents += `  <tr class="inactive ${order.type} ${order.resourceType}">\n`
          }

          table_contents += '    <td>\n'
          table_contents += `      ${order.created}\n`
          table_contents += '    </td>\n'

          table_contents += '    <td>\n'
          if (shard) {
            table_contents += `      ${shard}\n`
          } else {
            table_contents += `      &nbsp;`
          }
          table_contents += '    </td>\n'

          table_contents += '    <td>\n'
          if (order.roomName) {
            table_contents += `      <a href="https://screeps.com/a/#!/room/${shard}/${order.roomName}">${order.roomName}</a>\n`
          } else {
            table_contents += `      &nbsp;`
          }
          table_contents += '    </td>\n'

          table_contents += '    <td>\n'
          table_contents += `      ${order.type}\n`
          table_contents += '    </td>\n'

          table_contents += '    <td>\n'
          table_contents += `      ${order.resourceType}\n`
          table_contents += '    </td>\n'

          table_contents += '    <td>\n'
          table_contents += `      ${order.price}\n`
          table_contents += '    </td>\n'

          table_contents += '    <td>\n'
          table_contents += `      ${order.remainingAmount}\n`
          table_contents += '    </td>\n'

          table_contents += '    <td>\n'
          table_contents += `      ${order.totalAmount}\n`
          table_contents += '    </td>\n'
          table_contents += '  </tr>\n'
        }

        table_contents += '</tbody>\n'


        $('#orders_list tr').remove()
        $('#orders_list').append(table_contents)

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

function startScreepsOverview () {
  loadScreepsStats()
  $( "#stats_category_selector" ).change(loadScreepsStats)
  $( "#stats_interval_selector" ).change(loadScreepsStats)
}

var statsValueMap = {
  'creepsLost': 'Creep Parts',
  'creepsProduced': 'Creep Parts',
  'energyConstruction': 'Energy',
  'energyControl': 'Control Points',
  'energyCreeps': 'Energy',
  'energyHarvested': 'Energy',
  'powerProcessed': 'Power'
}

function loadScreepsStats () {
  var name = $( "#stats_category_selector" ).val();
  var interval = $( "#stats_interval_selector" ).val();

  var stats = getOverview(name, interval, {
    success: function (stats) {
      var shards = Object.keys(stats[['shards']])
      // Identify minimum and maximums
      let localMax = 0
      let localMin = Infinity
      for (var shard of shards) {
        if (!stats['shards'][shard].rooms.length) {
          continue
        }
        for (var room of stats['shards'][shard].rooms) {
          for (stat of stats['shards'][shard]['stats'][room]) {
            if (stat.value > localMax) {
              localMax = stat.value
            }
            if (stat.value < localMin) {
              localMin = stat.value
            }
          }
        }
      }

      localMax = (Math.ceil((localMax * 1.02)/100)*100)
      localMin = (Math.floor((localMin * 0.98)/100)*100)
      $('#overview_list').empty()
      // Build each graph
      for (var shard of shards) {
        if (!stats['shards'][shard].rooms.length) {
          continue
        }
        for (var room of stats['shards'][shard].rooms) {

          var divId = `overview_graph_${shard}_${room}`

          $('#overview_list').append(`<div>
            <h4 class="text-center"><a href="https://screeps.com/a/#!/room/${shard}/${room}">${room} ${shard}</a></h4>
            <div id="${divId}" style="height: 250px;"></div>
          </div>`)

          new Morris.Line({
            // ID of the element in which to draw the chart.
            element: divId,
            // Chart data records -- each entry in this array corresponds to a point on
            // the chart.
            data: stats['shards'][shard]['stats'][room],
            // The name of the data record attribute that contains x-values.
            xkey: 'endTime',
            // A list of names of data record attributes that contain y-values.
            ykeys: ['value'],
            // Labels for the ykeys -- will be displayed when you hover over the
            // chart.
            labels: [statsValueMap[name]],

            ymax: localMax,
            ymin: localMin,
            resize: true
          });
        }
      }
    }
  })
}
