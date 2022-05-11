

#
# read the data from the URL and print it
#
import urllib.request
# open a connection to a URL using urllib

import time

import sys


SLEEP_TIME = 0.5
SERVER_IP = sys.argv[1]

output_name = "client_delay.csv"
with open(output_name, 'a') as f:
    f.write("time,delay (seconds)")
    f.write("\n")

t_init_server = time.time()

while True:
    t_init = time.time()
    webUrl  = urllib.request.urlopen(f'http://{SERVER_IP}/')

    #get the result code and print it
    # print("result code: " + str(webUrl.getcode()))

    # read the data from the URL and print it
    data = webUrl.read()
    # print(data)
    time_delay = time.time() - t_init

    stat = "{},{:.3f}".format(
            time.time() - t_init_server,
            time_delay)

    with open(output_name, 'a') as f:
        f.write(stat)
        f.write("\n")

    time.sleep(SLEEP_TIME)