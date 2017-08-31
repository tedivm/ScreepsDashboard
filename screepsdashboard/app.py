from flask import Flask, session, redirect, url_for, escape, request, render_template, flash, send_from_directory, Response
from flask_cors import CORS, cross_origin
import json
import screepsdashboard.extensions.jinja
from screepsdashboard.services import esconsole
from screepsdashboard.services import screeps
from screepsdashboard import app


@app.route('/')
def index():
    #return render_template("index.html")
    return redirect(url_for('console'))

#
# Console Controls
#

@app.route('/console')
def console():
    return render_template("console.html")


@app.route('/console_messages.json')
def console_messages():
    start_at = request.args.get('start_at', 'now-1m')
    messages = esconsole.get_records(start_at)
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
    r = Response(response=json.dumps(data), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r


@app.route('/memory/keys/<shard>.json')
def memory_keys_json(shard):
    memory = screeps.get_memory(shard)
    if 'data' not in memory:
        memory['data'] = '{}'

    keys = list(memory['data'].keys())
    keys = sorted(keys, key=str.lower)
    r = Response(response=json.dumps(keys), status=200, mimetype="application/json")
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
        key_info['size'] = len(json.dumps(data))+len(key)+2 # 2 for the : and trailing ,
        if isinstance(data, (int, float, str, bool)):
            key_info['scalar'] = True
            key_info['data'] = data
        else:
            key_info['scalar'] = False
        ret.append(key_info)


    r = Response(response=json.dumps(ret), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r







@app.route('/segment/<shard>/<int:segment_id>.json')
def segment_json(shard, segment_id):
    segment = screeps.get_segment(shard, segment_id)
    if 'data' not in segment:
        segment['data'] = ''
    r = Response(response=json.dumps(segment['data']), status=200, mimetype="application/json")
    r.headers["Content-Type"] = "application/json; charset=utf-8"
    return r


@app.route('/shard_list.json')
def shard_list():
    shards = screeps.get_shards()
    r = Response(response=json.dumps(shards), status=200, mimetype="application/json")
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
