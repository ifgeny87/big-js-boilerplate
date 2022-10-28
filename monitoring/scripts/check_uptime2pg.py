#!/bin/python3.8

import requests
import simplejson as sjson
import json
import logging
import logging_loki

logging_loki.emitter.LokiEmitter.level_tag = "level"

# assign to a variable named handler
handler = logging_loki.LokiHandler(
   url="http://127.0.01:3100/loki/api/v1/push",
   version="1",
)

# create a new logger instance, name it whatever you want
logger = logging.getLogger("uptime")

res = requests.get('https://mon-check.ru/api/uptime')
jsres = res.json()
up=dict()
up['uptime_min']=jsres.get("uptime")["min"]

#data = json.dumps(res.json())
data = json.dumps(up)
#, serverEnv: {jsres.get("SERVER_ENV")}')
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)
logger.info(
 data,
 extra={ "tags": { "instance": "uptime" } },
)

from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

registry = CollectorRegistry()
g = Gauge('uptime_metrics', 'Description metric', registry=registry)
g.set(jsres.get("uptime")["min"])
push_to_gateway('localhost:9091', job='uptime_min', registry=registry)


print (jsres.get("uptime")["min"])
