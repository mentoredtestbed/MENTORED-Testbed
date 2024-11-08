#!/usr/bin/python3
#
# read the data from the URL and print it
#
import sys
import urllib.request
import time
import numpy as np
import argparse
import os
import random

agents = [
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)',

    # Linux users
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:61.0) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Mozilla/5.0 (X11; Gentoo; Linux x86_64; rv:61.0) AppleWebKit/537.36 (KHTML, like Gecko)',
]

headers = {"User-Agent":random.choice(agents)}

route_list = [
    '/',
    '/index',
    '/about',
    '/home',
    '/dashboard',
    '/profile',
    '/settings',
    '/api/v1',
    '/api/v1/data',
]

def create_random_route():
    # 15% chance of returning a static media file
    if random.random() < 0.15:
        if random.random() > 0.8:
            fname = random.choice([
                "logo.png",
                "background.jpg",
                "icon.ico",
                "style.css",
                "script.js",
            ])
            expected_size = np.random.exponential(2**14) # Average close to 16kb
        else:
            fname = f"file_{random.randint(1, 1000)}" + random.choice([
                ".mp4",
                ".pdf",
                ".zip",
                ".tar",
                ".gz",
                ".csv",
            ])
            expected_size = np.random.exponential(2**20) # Average close to 1MB

        return f'/static/{fname}', expected_size

    r = random.choice(route_list)
    expected_size = np.random.exponential(2**15) # Average close to 30kb
    if r == '/api/v1/data':
        r += random.choice([
            "/users",
            "/products",
            "/orders",
            "/invoices",
            "/payments",
            "/transactions",
        ])

        expected_size = np.random.exponential(2**17) # Average close to 130kb

        if random.random() > 0.5:
            r += f"/{random.randint(1, 1000)}"
            expected_size = np.random.exponential(2**18) # Average close to 260kb


    return r, expected_size

def start_requests(
        sleep_time_min,
        sleep_time_max,
        server_ip,
        output,
        silent,
        static_behavior):
    # Ensure that directory exists (recursive)
    os.makedirs(os.path.dirname(output), exist_ok=True)
    # if the output is a directory, append the file name
    if os.path.isdir(output):
        output = os.path.join(output, "client_delay.csv")

    with open(output, 'a') as f:
        f.write("time,delay (seconds)")
        f.write("\n")

    t_init_server = time.time()

    while True:
        t_init = time.time()
        get_params = {}

        if not static_behavior:
            random_route, expected_size = create_random_route()
            route = f'http://{server_ip}' + random_route
            if random.random() > 0.5:
                get_params['min_words'] = 1
                # Exponential probability considering max = 2**30 (1 GB)
                get_params['max_words'] = int(expected_size)
                route += "?" + "&".join([f"{k}={v}" for k, v in get_params.items()])
        else:
            route = f'http://{server_ip}/'


        if not silent:
            print(f"GET {route}")
        
        try:
            req = urllib.request.Request(route, headers=headers)
            webUrl = urllib.request.urlopen(req)
            data = webUrl.read()
            time_delay = time.time() - t_init

            stat = "{},{:.3f}".format(
                time.time() - t_init_server,
                time_delay)

            if not silent:
                print(stat)

            with open(output, 'a') as f:
                f.write(stat)
                f.write("\n")
                f.flush()

        except urllib.error.URLError as e:
            if not silent:
                print(f"Failed to reach the server: {e.reason}")
                with open(output, 'a') as f:
                    f.write("{},ERROR:{}".format(time.time() - t_init_server, e.reason))
                    f.write("\n")
                    f.flush()

        except Exception as e:
            if not silent:
                print(f"An error occurred: {e}")
                with open(output, 'a') as f:
                    f.write("{},ERROR:{}".format(time.time() - t_init_server, str(e)))
                    f.write("\n")
                    f.flush()
        # Flush stdout
        sys.stdout.flush()
        time.sleep(np.random.uniform(sleep_time_min, sleep_time_max))


if __name__ == "__main__":

    args = argparse.ArgumentParser()
    args.add_argument("-smin", "--sleep_time_min", help="Minimum sleep time", default=0.1, type=float)
    args.add_argument("-smax", "--sleep_time_max", help="Maximum sleep time", default=0.5, type=float)
    args.add_argument("-ip", "--server_ip", help="Server IP", default="localhost", type=str)
    args.add_argument("-o", "--output", help="Output file", default="/client_delay.csv")
    args.add_argument("-s", "--silent", help="Silent mode", action="store_true")

    # Store true
    args.add_argument('--static_behavior', action='store_true', help='Static behavior (no randomization)')

    args = args.parse_args()

    sleep_time_min = args.sleep_time_min
    sleep_time_max = args.sleep_time_max
    server_ip = args.server_ip
    output = args.output
    silent = args.silent
    static_behavior = args.static_behavior

    start_requests(
        sleep_time_min,
        sleep_time_max,
        server_ip,
        output,
        silent,
        static_behavior)
