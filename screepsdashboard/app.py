from flask import Flask, abort, session, redirect, url_for, escape, request, render_template, flash, send_from_directory, Response
from flask_cors import CORS, cross_origin
import json
import pypandoc
import screepsdashboard.extensions.jinja
from screepsdashboard.services import esconsole
from screepsdashboard.services import markdown
from screepsdashboard.services import screeps
from screepsdashboard import app



@app.route('/')
def index():
    if 'homepage' not in app.config:
        return redirect(url_for('console'))
    if not app.config['homepage']:
        return redirect(url_for('console'))
    return render_template("index.html", content=markdown.markdown_convert(app.config['homepage']))

#
# Console Controls
#

@app.route('/console')
def console():
    return render_template("console.html")


@app.route('/console_messages.json')
def console_messages():
    start_at = request.args.get('start_at', 'now-1m')
    max_records = int(request.args.get('max_records', 100))
    if max_records > 2000:
        max_records = 2000
    query = request.args.get('query', '*')
    messages = esconsole.query_records(query, start_at=start_at, max_records=max_records)
    r = Response(response=json.dumps(messages), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r

#
# Memory Controls
#

@app.route('/memory')
def memory():
    return render_template("memory.html")


@app.route('/memory/<shard>.json')
def memory_json(shard):
    path = request.args.get('path', False)
    memory = screeps.get_memory(shard)
    if 'data' not in memory:
        memory['data'] = '{}'
    if path:
        if path in memory['data']:
            data = memory['data'][path]
        else:
            data = False
    else:
        data = memory['data']
    r = Response(response=json.dumps(data, ensure_ascii=False), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r


@app.route('/memory/keys/<shard>.json')
def memory_keys_json(shard):
    memory = screeps.get_memory(shard)
    if 'data' not in memory:
        memory['data'] = '{}'

    keys = list(memory['data'].keys())
    keys = sorted(keys, key=str.lower)
    r = Response(response=json.dumps(keys, ensure_ascii=False), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r


@app.route('/memory/meta/<shard>.json')
def memory_meta_json(shard):
    memory = screeps.get_memory(shard)
    if 'data' not in memory:
        memory['data'] = '{}'

    ret = []

    keys = list(memory['data'].keys())
    keys = sorted(keys, key=str.lower)

    for key in keys:
        key_info = {}
        key_info['key'] = key
        data = memory['data'][key]
        key_info['size'] = len(json.dumps(data, ensure_ascii=False))+len(key)+2 # 2 for the : and trailing ,
        if isinstance(data, (int, float, str, bool)):
            key_info['scalar'] = True
            key_info['data'] = data
        else:
            key_info['scalar'] = False
        ret.append(key_info)


    r = Response(response=json.dumps(ret, ensure_ascii=False), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r



#
# Segment Data
#

@app.route('/segments')
def segments():
    return render_template("segments.html")


@app.route('/segments/<shard>/<int:segment_id>.json')
def segment_json(shard, segment_id):
    segment = screeps.get_segment(shard, segment_id)
    if 'data' not in segment:
        segment['data'] = ''
    r = Response(response=json.dumps(segment['data']), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r



#
# Wallet
#

@app.route('/wallet')
def wallet():
    return render_template("wallet.html")

# This is essentially a mirror of the game server's api for market data, but with a cache built on top.
@app.route('/wallet/<int:page>.json')
def wallet_page(page):
    transactions = screeps.get_wallet(page)
    r = Response(response=json.dumps(transactions), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r


#
# Market
#

@app.route('/orders.html')
def orders():
    return render_template("orders.html")


@app.route('/orders.json')
def orders_json():
    orders = screeps.get_orders()
    r = Response(response=json.dumps(orders), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r


#
# Meta
#

@app.route('/shard_list.json')
def shard_list():
    shards = screeps.get_shards()
    r = Response(response=json.dumps(shards), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r


@app.route('/user/shard.json')
def primary_shard():
    shard = screeps.get_primary_shard()
    r = Response(response=json.dumps({'shard':shard}), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r


#
# Rankings
#
@app.route('/rankings.html')
def rankings():
    rankings = screeps.get_rankings(app.config['screeps_user'])
    seasons = list(rankings.keys())
    seasons.sort(reverse=True)
    return render_template("rankings.html", rankings=rankings, seasons=seasons)


#
# Rooms Overview
#

@app.route('/rooms/overview.html')
def room_overview():
    return render_template("overview.html")


@app.route('/rooms/overview_<statName>_<int:statInterval>.json')
def room_overviews_json(statName, statInterval):
    try:
        stats = screeps.overview(interval=statInterval, statName=statName)
        r = Response(response=json.dumps(stats), status=200, mimetype="application/json")
        r.headers["Content-Type"] = "application/json; charset=utf-8"
        return r
    except ValueError as e:
        print("%s %s %s" % (e, statInterval, statName))
        abort(404)
