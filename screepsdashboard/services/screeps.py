from bs4 import BeautifulSoup
from datetime import datetime
from elasticsearch import Elasticsearch
import screepsapi
from screepsdashboard.services.cache import cache
import time
import json
from screepsdashboard import app

def get_client():
    user = app.config['screeps_user']
    password = app.config['screeps_password']
    return screepsapi.API(user, password)


def get_gcl(user):
    return get_me().get('gcl', 0)


def get_power():
    return get_me().get('power', 0)


def get_credits():
    return get_me().get('money', 0)


@cache.cache(expire=120)
def get_me():
    client = get_client()
    me = client.me()
    sanitize = ['gcl', 'power', 'money']
    for key in sanitize:
        if key not in me:
            me[key] = 0
    return me


@cache.cache(expire=120)
def get_memory(shard, path=''):
    client = get_client()
    memory = client.memory(path, shard)
    return memory


@cache.cache(expire=120)
def get_segment(shard, segmentid):
    client = get_client()
    segment = client.get_segment(segmentid, shard)
    return segment


@cache.cache(expire=120)
def get_shards():
    client = get_client()
    return client.get_shards()


@cache.cache(expire=120)
def get_rooms():
    client = get_client()
    overviewresults = client.overview()
    shards = get_shards()
    rooms = {}
    for shard in shards:
        rooms[shard] = overviewresults['shards'][shard]['rooms']
    return rooms


@cache.cache(expire=120)
def get_primary_shard():
    shards = get_shards()
    rooms = get_rooms()
    currooms = 0
    curshard = 'shard0'
    for shard in shards:
        if shard in rooms and len(rooms[shard]) > currooms:
            curshard = shard
            currooms = len(rooms[shard])
    return curshard


@cache.cache(expire=30)
def get_wallet(page=None):
    client = get_client()
    return client.market_history(page=page)


@cache.cache(expire=30)
def get_orders():
    client = get_client()
    return client.my_orders()


@cache.cache(expire=600)
def get_rankings(user):
    client = get_client()
    rankings = {}
    gcl_rankings = client.board_find(username=user, mode='world')
    if 'list'in gcl_rankings:
        for season in gcl_rankings['list']:
            rankings[season['season']] = {}
            rankings[season['season']]['gcl'] = {
                'rank': season['rank'],
                'score': season['score']
            }
    power_rankings = client.board_find(username=user, mode='power')
    if 'list'in power_rankings:
        for season in power_rankings['list']:
            if season['season'] not in rankings:
                rankings[season['season']] = {}
            rankings[season['season']]['power'] = {
                'rank': season['rank'],
                'score': season['score']
            }

    print(rankings)
    return rankings



def import_socket():
    screepsconsole = ScreepsConsole(
        user=app.config['screeps_user'],
        password=app.config['screeps_password'],
        ptr=app.config.get('screeps_ptr', False),
    )
    screepsconsole.set_es_host(
        host=app.config.get('es_host', 'localhost'),
        index_prefix=app.config.get('es_index_prefix', 'screepsdash-%s-' % (app.config['screeps_user'].lower(),)),
    )
    screepsconsole.start()




## Python before 2.7.10 or so has somewhat broken SSL support that throws a warning; suppress it
import warnings
warnings.filterwarnings('ignore', message='.*true sslcontext object.*')

class ScreepsConsole(screepsapi.Socket):

    def set_es_host(self, host='localhost', index_prefix='screepsdash-'):
        self.es = Elasticsearch([host])
        self.index_prefix = index_prefix

    def set_subscriptions(self):
        self.subscribe_user('console')
        self.subscribe_user('cpu')

    def process_log(self, ws, message, shard):
        message_soup = BeautifulSoup(message,  "lxml")
        body = {
            'timestamp': datetime.utcnow(),
            'mtype': 'log',
            'shard': shard,
            'raw': message
        }

        if message_soup.log:
            tag = message_soup.log
        elif message_soup.font:
            tag = message_soup.font
        else:
            tag = False

        if tag:
            for key,elem in tag.attrs.items():
                if key == 'color':
                    continue

                # If it's an integer convert it from string
                if elem.isdigit():
                    body[key] = int(elem)
                    continue

                # Check to see if it is a float
                try:
                    newelem = float(elem)
                    body[key] = newelem
                except ValueError:
                    pass

                # Okay fine it's a string
                body[key] = elem

        message_text = message_soup.get_text()
        message_text.strip()
        body['message'] = message_text.replace("\t", ' ')
        res = self.es.index(index=self.index_prefix + 'console-' + time.strftime("%Y_%m"), doc_type="log", body=body)

    def process_results(self, ws, message, shard):
        body = {
            'timestamp': datetime.utcnow(),
            'message': message,
            'mtype': 'results',
            'shard': shard
        }
        res = self.es.index(index=self.index_prefix + 'console-' + time.strftime("%Y_%m"), doc_type="log", body=body)

    def process_error(self, ws, message, shard):
        body = {
            'timestamp': datetime.utcnow(),
            'message': message,
            'mtype': 'error',
            'severity': 5,
            'shard': shard
        }
        res = self.es.index(index=self.index_prefix + 'console-' + time.strftime("%Y_%m"), doc_type="log", body=body)

    def process_cpu(self, ws, data):
        body = {
            'timestamp': datetime.utcnow()
        }

        if 'cpu' in data:
            body['cpu'] = data['cpu']

        if 'memory' in data:
            body['memory'] = data['memory']

        if 'cpu' in data or 'memory' in data:
            res = self.es.index(index=self.index_prefix + 'performance-' + time.strftime("%Y_%m"), doc_type="performance", body=body)
