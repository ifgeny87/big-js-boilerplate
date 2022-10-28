#!/bin/bash

TIMEOUT=25
TIMESTAMP=`echo | date`
TG_BOT_TOKEN='5436761479:AAEUhvUpDGJCOQgFPAkt6IIIEIcVwWLn-As'
TG_URL="https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage"
TG_CHAT_ID='-876097972'
num=30

for i in $(cat ./domains.txt)
do
RETVAL=0
EXPIRE_DATE=`echo | openssl s_client -connect $i:443 -servername $i -tlsextdebug 2>/dev/null |\
 openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d'=' -f2`
EXPIRE_SECS=`date -d "${EXPIRE_DATE}" +%s`
EXPIRE_TIME=$(( ${EXPIRE_SECS} - `date +%s` ))
RETVAL=$(( ${EXPIRE_TIME} / 24 / 3600 ))
    if [ $RETVAL -lt $num ]
    then
     /usr/bin/curl -s -X POST $TG_URL -d chat_id=$TG_CHAT_ID -d parse_mode=HTML -d text="Внимание domain $i истекает через  $RETVAL дн."
    fi
done

