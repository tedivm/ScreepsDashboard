from screepsdashboard import app
from screepsdashboard.services import screeps

app.jinja_env.globals.update(getuserinfo=screeps.get_me)
app.jinja_env.globals.update(get_shards=screeps.get_shards)
app.jinja_env.globals.update(get_primary_shard=screeps.get_primary_shard)

def get_gcl_from_points(points):
    if points <= 0:
        return 1
    return int((points/1000000) ** (1/2.4))+1

app.jinja_env.globals.update(get_gcl_from_points=get_gcl_from_points)


