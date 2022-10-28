#!/usr/bin/python3

import os
import subprocess as sp
import requests
from datetime import datetime,timedelta, date, time, timezone
import pytz
import logging
import configparser  # импортируем библиотеку
config = configparser.ConfigParser()  # создаём объекта парсера
config.read(".env")  # читаем конфиг

loc=config['local']

#Метка бэкапов
tag=loc['tag']
# расположение лога
logdir=loc['logdir']

# имя файла лога
filename=logdir+"/backup_"+tag+".log"

# Включаем логирование, чтобы не пропустить важные сообщения
logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s',
                    level=logging.DEBUG,
                    filename=filename)
#база данных для бэкапа
dbname=loc['dbname']

#реквизиты телеграм бота
tg=config['telegramBot']
URL=tg['TG_URL']
botToken=tg['TG_BOT_TOKEN']
chatId=tg['TG_CHAT_ID']
MSG=''

# Текущия дата время в часовом поясе Екатеринбург
now = datetime.now(pytz.timezone(loc['timezone']))

# текущая date
tdate = now.strftime('%Y%m%d')

# текущее время
ttime = now.strftime("%H%M%S")

try:
    CDN=config['CDN']

    #Получаем токен и урл
    headers = {"X-Auth-User": CDN["user"], "X-Auth-Key": CDN["password"]}
    r = requests.get("https://auth.selcdn.ru/", headers=headers)
    if r.status_code == 204:
        auth_token = r.headers.get("X-Auth-Token")
        storage_url = r.headers.get("X-Storage-Url")
        MSG += (f"\n successful get token: status={r.status_code}, cdn_token={auth_token}, url={storage_url} ")
    else:
        MSG += (f"\n error get token: status={r.status_code}, cdn_token={auth_token}, url={storage_url} ")
        exit()

    check_user=CDN['check_user']
    # check files in container
    r = requests.get(storage_url+'v1/'+check_user, headers={"X-Auth-Token": auth_token})
    r.raise_for_status()
    cont = r.content.decode('utf-8').split('\n')
    MSG += (f" response content files: {cont}")
finally:
    tg_param = (f" -s -X POST {URL}{botToken}/sendMessage -d chat_id={chatId} -d text='{MSG}'")
    os.system(f"/usr/bin/curl {tg_param}")
print (MSG)
