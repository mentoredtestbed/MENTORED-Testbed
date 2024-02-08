#!/usr/bin/python3
import os, signal, sys
import argparse
from experimentation import Experimentation
from datetime import datetime, timedelta
from time import sleep

from kube import Kube
import logging


def signal_handler(sig, frame):
    print('\nCANCEL - Wait... \n')
    logging.info("CTRL C pressed. Removing experiment resources...")
    os.system("kubectl delete deploy,pod,svc --all > /dev/null 2>&1")
    logging.info("Experiment CALLED OFF!")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

parser = argparse.ArgumentParser()
parser.add_argument("-f", dest="file", help="read schedule file yaml")
parser.add_argument("-l", dest="log", help="Time to get log from Kubernetes")
args = parser.parse_args()
log_time = 1

if args.log:
    log_time = int(float(args.log)*60)

exp = Experimentation(args.file)
experiment = exp.experimentation

logging.basicConfig(filename='./logs/experiment_{}_{}.log'.format(experiment.name, experiment.id),
                    filemode='a',
                    format='%(asctime)s - [%(levelname)s] - %(message)s',
                    level=logging.INFO)

exp_time = 0
for t in exp.manifests:
    exp_time = exp_time + t.run

start = datetime.now()
end = start + timedelta(minutes=experiment.time)

os.system("clear")
logging.info("Experiment: {},  ID: {}".format(experiment.name, experiment.id))


kube = Kube()

now = datetime.now()
log_data = now
control_log = 0
print("Experiment name: {}, ID: {} - Starting...".format(experiment.name, experiment.id))
server_ip = None
while now <= end:

    kube.update_data()
    for manifest in exp.manifests:
        if not manifest.started and now >= (start + timedelta(minutes=manifest.run)):
            logging.info("Run {}".format(manifest.type))
            if manifest.type == 'server':
                r = kube.apply(manifest.path, manifest.kind)
                logging.info("guarantee execution")
                kube.guarantee_execution(manifest.type)
                start = datetime.now()
                end = start + timedelta(minutes=experiment.time)
                logging.info("{} started".format(manifest.type))
            else:
                r = kube.apply(manifest.path, manifest.kind, server_ips=server_ips)
                
            manifest.started = True
            server_pod = r
        
            # server_ip = kube.get_pod_ip('server')
            # server_ips = kube.get_pod_ip('server', 'mentored/macvlan-3169-mentored-whx-es')
            server_ips = kube.get_pod_ip('server')
            print(server_ips)
            print("")
            print("")
            print("")

        if now >= log_data:
            exp.set_info(kube.get_info(manifest.type))
            if manifest.type == 'server' and manifest.started and not manifest.dropped:
                logging.info("Saving pcap file on ./pcap/{}_{}.pcap".format(
                    experiment.name,
                    experiment.id))

                os.system("kubectl cp -c tcpdump {}:/app/pcap_server.pcap ./pcap/{}_{}.pcap > /dev/null 2>&1".format(
                    kube.get_name(manifest.type),
                    experiment.name,
                    experiment.id)
                )
            control_log = control_log + 1
            if control_log == len(exp.manifests):
                log_data = now + timedelta(seconds=log_time)
                control_log = 0
        if not manifest.dropped and now >= (end - timedelta(minutes=manifest.stop)):
            logging.info("Stoping {}".format(manifest.type))
            if manifest.type == 'server':
                logging.info("Saving pcap file on ./pcap/{}_{}.pcap".format(
                    experiment.name,
                    experiment.id))
                os.system("kubectl cp -c tcpdump {}:/app/pcap_server.pcap ./pcap/{}_{}.pcap > /dev/null 2>&1".format(
                    kube.get_name(manifest.type),
                    experiment.name,
                    experiment.id)
                )
                logging.info("Generating chart")
                os.system("kubectl exec -it -c tcpdump {} --  python3 plot.py > /dev/null 2>&1".format(
                    kube.get_name(manifest.type)))
                logging.info("Saving png file on ./graficos/{}_{}.png".format(
                    experiment.name,
                    experiment.id))
                os.system("kubectl cp -c tcpdump {}:/app/graficos/bandwidth_server.pcap.png ./graficos/{}_{}.png > /dev/null 2>&1".format(
                    kube.get_name(manifest.type),
                    experiment.name,
                    experiment.id)
                )
                logging.info("Stoping {}".format('server'))
            kube.delete(manifest.type, manifest.kind)
            manifest.dropped = True

    os.system("tput cuu1; tput dl1")
    print("Experiment name: {}, ID: {} - AGE {}s".format(experiment.name, experiment.id, int((datetime.now() - start).total_seconds())))
    sleep(1)
    now = datetime.now()

for manifest in exp.manifests:
    if not manifest.dropped:
        if manifest.type == 'server':
            logging.info("Saving pcap file on ./pcap/{}_{}.pcap".format(
                experiment.name,
                experiment.id))
            os.system("kubectl cp -c tcpdump {}:/app/pcap_server.pcap ./pcap/{}_{}.pcap > /dev/null 2>&1".format(
                kube.get_name(manifest.type),
                experiment.name,
                experiment.id)
            )
            logging.info("Generating chart")
            os.system("kubectl exec -it -c tcpdump {} --  python3 plot.py > /dev/null 2>&1".format(
                kube.get_name(manifest.type)))
            logging.info("Saving png file on ./graficos/{}_{}.png".format(
                experiment.name,
                experiment.id))
            os.system(
                "kubectl cp -c tcpdump {}:/app/graficos/bandwidth_server.pcap.png ./graficos/{}_{}.png > /dev/null 2>&1".format(
                    kube.get_name(manifest.type),
                    experiment.name,
                    experiment.id)
            )
            logging.info("Stoping {}".format('server'))
        kube.delete(manifest.type, manifest.kind)

logging.info("Exporting ./csv/{}.csv".format(experiment.name+'_'+str(experiment.id)))
exp.export_csv()
logging.info("Experiment DONE!")
exit(0)