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
debug=loc['debug']
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
debug_MSG = (f"debug = {debug}, ")

# Текущия дата время в часовом поясе Екатеринбург
now = datetime.now(pytz.timezone(loc['timezone']))

# текущая date
tdate = now.strftime('%Y%m%d')

# текущее время
ttime = now.strftime("%H%M%S")

#каталог для бэкапов
bdir=loc['backup_dir']

#format <dbname>_<YYMMDD>_<hhmmss>_{tag}.sql.gz
bfile=(f"{dbname}_{tdate}_{ttime}_{tag}.sql")

try:
    mysqldump = (f"/usr/bin/mysqldump {dbname} >{bdir}{bfile}")
    out = sp.getoutput(mysqldump)
    if out == '':
        debug_MSG += (f" successful mysqldump database {dbname} to backupfile={bfile}, ")
    else:
        MSG += (f" errors on mysqldump {dbname} backupfile={bfile}, {out}")
        exit()
    gzip=(f"/bin/gzip -9 {bdir}{bfile}")
    out = sp.getoutput(gzip)
    if out == '':
        debug_MSG +=(f"\n successful gzip backupfile={bfile}.gz")
    else:
        MSG +=(f"\n error of gzip backupfile={bfile}.gz {out}")
        exit()
    CDN=config['CDN']

    #Получаем токен и урл
    headers = {"X-Auth-User": CDN["user"], "X-Auth-Key": CDN["password"]}
    r = requests.get("https://auth.selcdn.ru/", headers=headers)
    if r.status_code == 204:
        auth_token = r.headers.get("X-Auth-Token")
        storage_url = r.headers.get("X-Storage-Url")
        debug_MSG += (f"\n successful get token: status={r.status_code}, cdn_token={auth_token}, url={storage_url} ")
    else:
        MSG += (f"\n error get token: status={r.status_code}, cdn_token={auth_token}, url={storage_url} ")
        exit()

    filename = (f"{bfile}.gz")
    data = open(bdir+filename, "rb").read()
    folder = "/"+tag+"/"+now.strftime('%Y')+"/"
    Delete_After=CDN['Delete_After']
    put_user=CDN['put_user']
    check_user=CDN['check_user']

    # Отправляем файл в Selectel CDN widrh retention 1 год
    headers = {"X-Auth-Token": auth_token, "X-Delete-After" : Delete_After}
    r = requests.put(storage_url + put_user + folder + filename, data=data, headers=headers)

    # check status
    r.raise_for_status()
    if r.status_code == 201:
        rm=(f"/bin/rm -f {bdir}{filename}") # удаляем после успешной передачи
        out = sp.getoutput(rm)
        MSG += (f"\n successful request status of put file {bfile}.gz on Selectel CDN ")
        debug_MSG += (f"\n {r.status_code} {out}")
    else:
        MSG += (f"\n error request status of put={r.status_code} {out}")
        exit()

    # check files in container
    r = requests.get(storage_url+'v1/'+check_user, headers={"X-Auth-Token": auth_token})
    r.raise_for_status()
    cont = r.content.decode('utf-8').split('\n')
    debug_MSG += (f" response content files: {cont}")
    if debug == 'yes':
      tg_param = (f" -s -X POST {URL}{botToken}/sendMessage -d chat_id={chatId} -d text='{debug_MSG}\n {MSG}'")
    else:
      tg_param = (f" -s -X POST {URL}{botToken}/sendMessage -d chat_id={chatId} -d text='{MSG}'")
finally:
    os.system(f"/usr/bin/curl {tg_param}")

print (cont)
