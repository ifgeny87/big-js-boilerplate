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

MSG= """*bold \*text*
_italic \*text_
__underline__
~strikethrough~
||spoiler||
*bold _italic bold ~italic bold strikethrough ||italic bold strikethrough spoiler||~ __underline italic bold___ bold*
[inline URL](http://www.example.com/)
[inline mention of a user](tg://user?id=123456789)
`inline fixed-width code`
```
pre-formatted fixed-width code block
```
```python
pre-formatted fixed-width code block written in the Python programming language
```"""

tg_param = (f" -s -X POST {URL}{botToken}/sendMessage -d chat_id={chatId} -d parse_mode=Markdownv2 -d text='{MSG}'")
os.system(f"/usr/bin/curl {tg_param}")
