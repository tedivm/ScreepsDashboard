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
    memory = screeps.get_memory(shard)
    if 'data' not in memory:
        memory['data'] = '{}'
    r = Response(response=json.dumps(memory['data']), status=200, mimetype="application/json")
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
