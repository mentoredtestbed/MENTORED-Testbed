#!/usr/bin/python

import multiprocessing as MP
import subprocess
import pandas as pd
import os
from itertools import groupby
import sys
from tqdm import tqdm
import matplotlib.pyplot as plt


os.system('mkdir graficos')

PCAPFILES = ['./pcaps/' ]

def getPCapFileNames():
    
    lines = PCAPFILES
    
    pcapfilenames = []
    for eachline in tqdm(lines):
        if eachline.endswith('.pcap'):
            if os.path.exists(eachline):
                pcapfilenames.append(eachline)
            else:
                print(eachline + ' does not exist')
                exit()
        else:
            if os.path.isdir(eachline):
                for eachfile in os.listdir(eachline):
                    if eachfile.endswith('.pcap'):
                        pcapfilenames.append(eachline.rstrip('/') + '/' + eachfile)
            else:
                print(eachline + ' is not a directory')
                exit()
    return pcapfilenames


unidades = ['Segundos', 'Megabits']
inputfiles = getPCapFileNames()

tasks = []
for patch in tqdm(inputfiles):
    filename = patch.split('/')[-1]
    print(filename)
    command = ['tshark -nr {} -q -z io,stat,1,BYTES | grep -P '.format(patch), '"\d+\s+<>\s+\d+\s*\|\s+\d+"  |', "awk -F '[ |]+'", '{print $2","($5*8/1000000)}']

    
    os.system(command[0]+command[1]+command[2]+" '"+command[3]+"' "+"> ./pcaps/bandwidth_{}.csv".format(filename))


    all_devices_samples = pd.read_csv('./pcaps/bandwidth_{}.csv'.format(filename), names=unidades)

    all_devices_samples.plot(kind='line',x=unidades[0],y=unidades[1])
    
    plt.savefig('graficos/bandwidth_{}.png'.format(filename))
    