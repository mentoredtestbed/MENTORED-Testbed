t50 $SERVER --flood --turbo --protocol $PROTOCOL >> /dev/null 2>&1 &
T50_PID=$!
T50_CPID=$(( $T50_PID + 2 ))
sleep 30
kill -9 $T50_PID
kill -9 $T50_CPID
