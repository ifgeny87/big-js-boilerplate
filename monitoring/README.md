# Сервисный стек в docker-compose:

```
prometheus:
    image: prom/prometheus:v2.33.5
alertmanager:
    image: prom/alertmanager:v0.23.0
nodeexporter:
    image: prom/node-exporter:v0.18.1
cadvisor:
    image: gcr.io/google-containers/cadvisor:v0.34.0
grafana:
    image: grafana/grafana:8.3.7
pushgateway:
    image: prom/pushgateway:v1.4.2
loki:
    image: grafana/loki:2.4.2
promtail:
    image: grafana/promtail:2.4.2
prometheus_bot:
    image: moghaddas/prometheus_bot
registry:
    image: registry:2.8.1
```

## На хостовой машине nginx + certbot c пробросами на доменах:

mrvk.cf
### [cadvisor - сборщик метрик с контейнеров](https://cad.mrvk.cf)
### [grafana](https://graf.mrvk.cf)
### [loki](https://loki.mrvk.cf) 
### [node exporter - сборщик метрик узла](https://nodeexporter.mrvk.cf) 
### [prometheus](https://prom.mrvk.cf)
### [alertmanager](https://alert.mrvk.cf)
### [registry](https://dhub.mrvk.cf)

## Установка docker docker-compose по инструкции 
https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04-ru


## Разворачиваем стек мониторинга в докере

```
в файле .env описаны параметры и настройки
в файле docker-compose.yml параметры сервисы

volumes находятся по пути:

/var/lib/docker/volumes
	docker_alertmanager_data
	docker_grafana_data
	docker_prometheus_data
	docker_loki_data
```

## На серверах за которыми мониторим устанавливаем сборщики логов node-exporter 0.18.1

```
на Ubuntu 18.04 нужно устанавливать вручную по инструкции https://devopscube.com/monitor-linux-servers-prometheus-node-exporter/
```

## Для ограничения доступа к метрикам, порт 9100 оставляем только разрешенные ip адреса на брандмауэре

```
iptables -A INPUT -p tcp -s 91.201.53.219 --dport 9100 -j ACCEPT
iptables -A INPUT -p tcp -s 213.191.12.27 --dport 9100 -j ACCEPT
iptables -A INPUT -p tcp --dports 9100 -j DROP
```

### Хранение метрик 3 месяца
- Для prometheus прописывается в docker-compose
- Для loki в файле local-config.yaml
