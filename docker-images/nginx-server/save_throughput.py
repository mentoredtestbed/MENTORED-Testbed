import time
import psutil


output_name = "server_throughput.csv"
with open(output_name, 'a') as f:
    f.write("time,mbit/s")
    f.write("\n")

t_init = time.time()


def main():
    old_value = 0    

    while True:
        new_value = psutil.net_io_counters().bytes_sent + psutil.net_io_counters().bytes_recv

        if old_value:
            send_stat(new_value - old_value)

        old_value = new_value

        time.sleep(1)

def convert_to_gbit(value):
    return value/1024./1024./1024.*8

def convert_to_mbit(value):
    return value/1024./1024.*8

def send_stat(value):
    stat = "{},{:.3f}".format(
            time.time() - t_init,
            convert_to_mbit(value))

    print(stat)
    with open(output_name, 'a') as f:
        f.write(stat)
        f.write("\n")

main()
