Kubernetes is a platform widely used in network and cybersecurity simulations, allowing the automation of deployment, scaling and management of applications in test environments. It provides a flexible and scalable environment for running cyber attack experiments, such as DDoS (Distributed Denial of Service), in containers. With Kubernetes, you can quickly create, deploy, and scale test environments to assess the resilience of systems and applications to cyber threats. To achieve this, YAML files are used to define the configuration of these test environments, declaratively describing the desired state of the system. 

In this document, we will present three YAML files that represent an example of a client, attacker and server, respectively.

## Client Configuration: `example_yaml_client`

```yaml
- name: 'generic-client-go'
  persitent_volume_path: "/client_delay.csv"
  replicas: 70
  containers:
    - name: 'client-go'
      image: ghcr.io/mentoredtestbed/generic-client:latest
      command: ["/entry.sh"]
      args: ['python3', 'client_web_metrics.py', "1", "1"]
      env:
        - name: TIMEOUT_CMD
          value: "300"
        - name: ADD_SERVER_IP_TO_COMMAND
          value: "true"
      resources:
        requests:
          memory: "64Mi"
          cpu: "100m"
        limits:
          memory: "128M"
          cpu: "200m"
  region: 'ids-go'
```

The YAML example file `example_yaml_client` presents the definition of a set of pods that will act as clients, making HTTP GET requests to a web server hosted in another pod. Here is a detailed breakdown of the YAML file:

> name: 'generic-client-go'
>
> Deployment name.

---

> persitent_volume_path: '/client_delay.csv'
>
> This is where request response times will be saved in a CSV file.

---

> replicas: '70'
>
> Pods will be created that will work as clients.

---

> containers:
>
> Container description.

---

> name: 'client-go'
>
> Container name.
---

> image: [ghcr.io/mentoredtestbed/generic-client:latest](ghcr.io/mentoredtestbed/generic-client:latest)
>
> The Docker image that will be used to create this container.
---

> command:  ["/entry.sh"]
>
>   Startup command.
---

> args: ['python3', 'client_web_metrics.py', "1", "1"]
>
>   These are the arguments passed to the Python script that will perform web requests.
---

> env: Environment variables.
>
>   - name: TIMEOUT_CMD 
>   - value: "300"
>
>     Timeout (in seconds) for each HTTP GET request.
>
>   - name: ADD_SERVER_IP_TO_COMMAND
>   - value: "true"
>
>     Indicates whether to add the server IP address to the command.
---

> - resources: Container resources.
>   - requests: Defines the minimum resources the container needs.
>     - memory: "64Mi"
>     - cpu: "100m"
>
>       (64Mi memory e 100m CPU).

>   - limits: Sets the maximum resources the container can use.
>     - memory: "128M"
>     - cpu: "200m"
>
>       (128Mi memory e 200m CPU).

---

> region:  'ids-go'
>
> This is the name of the region where the pods will run in the RNP National Cluster. 


This configuration will ensure that 70 client pods are running, each making HTTP GET requests at a 1-second interval for 300 seconds to a web server hosted elsewhere, and recording the response times of these requests in a CSV file at the specified path.

## Attacker Configuration: `example_yaml_botnet`

```yaml
- name: 'generic-botnet-pb'
  persitent_volume_path: "/MENTORED_IP_LIST.yaml"
  replicas: 10
  containers:
    - name: 'botnet-pb'
      image: ghcr.io/mentoredtestbed/generic-botnet:latest
      command: ["/entry.sh"]
      args: ["slowloris", "-p", "80"]
      env:
        - name: PROTOCOL
          value: "ICMP"
        - name: TIMEOUT_CMD
          value: "180"
        - name: TIME_WAIT_START
          value: "60"
        - name: ADD_SERVER_IP_TO_COMMAND
          value: "true"
      resources:
        requests:
          memory: "64Mi"
          cpu: "100m"
        limits:
          memory: "128M"
          cpu: "200m"
  region: 'ids-pb'
```

The YAML file `example_yaml_botnet` defines a set of pods that will act as attackers, carrying out a distributed denial of service (DDoS) attack. Here is a detailed content breakdown:

> name: 'generic-botnet-pb'
>
> Deployment name.

---

> persitent_volume_path: "/MENTORED_IP_LIST.yaml"
>
> This is the path where a list of monitored IPs will be stored.

---

> replicas: 10
>
> 10 pods will be created that will carry out the attacks.

---

> containers:
>
> Containers description.

---

> name: 'botnet-pb'
>
> Container name.

---

> image: [ghcr.io/mentoredtestbed/generic-botnet:latest](ghcr.io/mentoredtestbed/generic-botnet:latest)
>
> The Docker image that will be used to create this container, configured with the DDoS attack tool, Slowloris.

---

> command: ["/entry.sh"]
>
> Startup command.

---

> args: ["slowloris", "-p", "80"]
>
> Command arguments. Configures the Slowloris attack, specifying port 80 as the target.

------

> env: Environment variables.
>
>   - name: PROTOCOL 
>   - value: "ICMP"
>
>     Defines the protocol to be used in attacks.
>
>   - name: TIMEOUT_CMD
>
>   - value: "180"
>
>     Timeout (in seconds) for each request.
>
>   - name: TIME_WAIT_START 
>   - value: "60"
>
>     Cooldown time before the attack begins (in seconds).
>
>   - name: ADD_SERVER_IP_TO_COMMAND
>   - value: "true"
>
>     Indicates whether to add the server IP address to the command.
---

> - resources: Container resources.
>   - requests: Defines the minimum resources the container needs.
>     - memory: "64Mi"
>     - cpu: "100m"
>
>       (64Mi memory e 100m CPU).

>   - limits: Sets the maximum resources the container can use.
>     - memory: "128M"
>     - cpu: "200m"
>
>       (128Mi memory e 200m CPU).

---

> region: 'ids-go'
>
> This is the name of the region where the pods will run in the RNP National Cluster.

This YAML file defines a botnet that will perform denial of service attacks using the Slowloris method over the ICMP protocol. Each of the 10 generated pods will be responsible for carrying out these attacks. Attack results and configurations will be logged to a persistent volume located at "/MENTORED_IP_LIST.yaml".


```yaml title="example_yaml_server"
 name: slowloris_experiment
 nodeactors:
   - name: 'na-server'
     persitent_volume_path: "/app/packets.pcap"
     replicas: 1
     containers:
       - name: tshark
         image: ghcr.io/mentoredtestbed/mentored-tshark
         command: ["/entry.sh"]
         args: ["tshark", "-i", "net1", "-x", "-w", "packets.pcap"]
         env:
           - name: TIMEOUT_CMD
             value: "300"          
       - name: 'server'
         image: ghcr.io/mentoredtestbed/generic-apache-flask-webserver:latest
         ports:
           - containerPort: 80
         resources:
           requests:
             memory: "1G"
             cpu: "1"
           limits:
             memory: "2G"
             cpu: "2"
    region: 'ids-pe'
```

The "example_yaml_server" file describes the configuration of a networking and cybersecurity experiment using Kubernetes. Here we present a description of the file contents:

> name: 'slowloris_experiment'
>
> Deployment name.

---

> nodeactors: Pod description.
>
> name: 'na-server'
>
>   Pod name.

---

> persitent_volume_path: "/app/packets.pcap"
>
> Capture file that will be saved automatically.

---

> replicas: 1
>
> Number of pods.

---

> containers: Container description.
>
> name: 'tshark'
>
>   Name of the container responsible for capturing traffic.

---

> image: ghcr.io/mentoredtestbed/mentored-tshark
>
> Container image responsible for capturing traffic.

---

> command: ["/entry.sh"]
>
> Startup command.

---

> args: ["tshark", "-i", "net1", "-x", "-w", "packets.pcap"]
>
> Command arguments. Configures Tshark to capture packets on the 'net1' interface and save to a pcap file.

---

> env: Environment variables.
>
>   - name: TIMEOUT_CMD
>   - value: "300"
>
>   Timeout (in seconds) for the pod to run.

---

> name: 'server'
>
> Container name.

---

> image: [ghcr.io/mentoredtestbed/generic-apache-flask-webserver:latest](ghcr.io/mentoredtestbed/generic-apache-flask-webserver:latest)
>
> This Docker image contains an Apache server with the Flask framework.

---

> ports: 
>
>   - containerPort: 80
>
> This is the port that will be exposed by the web server.

---

> resources: Container resources.
>
> - requests: Defines the minimum resources the container needs.
>     - memory: "1G"
>     - cpu: "1"
>
>     (1G memory and 1 CPU).
>
> - limits: Sets the maximum resources the container can use.
>     - memory: "2G"
>     - cpu: "2"
>
>     (2G memory and 2 CPUs).

---

> region: 'ids-pe'
>
> This is the name of the geographic region where the pods will run within the National Cluster, specified in the Federative Unit format.


In summary, the file describes an experiment where one pod captures network traffic using the Tshark tool and saves it in a pcap file, while another pod runs a web server using the Apache image with the Flask framework, exposing it on the port 80. Both pods will be executed in the Pernambuco region within the National Cluster.