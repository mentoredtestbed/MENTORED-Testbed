<!-- First, the researcher must establish what topology will be needed for his experiment. In this example, a simple topology will be constructed for demonstration purposes. In the code below, a topology will be created consisting of two pods interconnected using iperf software. The first pod, named "na-server", will be connected to the IDS-SC and will act as the server for the communication between the pods. The second pod, called "lan-2-0", will have a replica called "lan-2-1" and will be connected to the IDS-MG, playing the role of a client for the iperf software. -->

Here is an example of the YAML file with the topology:

```yaml title="exemplo_mentored"
Experiment:
    name: exemplo_mentored # @

    nodeactors:
        - name: 'na-server'
            replicas: 1
            containers: # (1)
                - name: na-server
                    image: ddgemmer/generic-client:v1
                    imagePullPolicy: "Always"
                    command: ["tail", "-f", "/dev/null"]
                    securityContext:
                    privileged: true
        region: 'ids-sc'
        - name: 'lan-2'
            replicas: 2
            containers: # (1)
                - name: lan-2
                    image: ddgemmer/generic-client:v1
                    imagePullPolicy: "Always"
                    command: ["tail", "-f", "/dev/null"]
                    securityContext:
                        privileged: true
        region: 'ids-mg'
    topology: 'ovs_fully_connected'

```
<!-- 
1.  In this part, you should add the definition of a Kubernetes pod, created by you.


In the YAML code, you can see that the information in it is used to build the topology. The YAML describes the different elements, such as experiments, node actors and their configurations, regions, and other properties relevant for creating the topology.

The example consists of the following items:

- 'name': name of the experiment;
- 'nodeactors': nodes of the topology. The user must insert at least one node;
- '- name': Name that identifies the nodeactor;
- 'replicas': Number of replicas;
- 'image': Image used by the pods;
- 'imagePullPolicy': Tells Kubernetes to pull the image from the registry;
- 'command': Command used to keep a container active
- 'privileged': Permission assigned to the pod
- 'region': Name of a worker in the IDS. If 'auto', the service will automatically identify a worker to instantiate the - containers;
- 'topology': create an OVS (Open Virtual Switch) for each region used. All nodes in a region will have a link to their OVS on the network interface called 'ovs-link'.

This is the basic information for building the topology in the YAML file. It is important to adjust the values as needed for your experiment.

Remember that this is just a simple example for demonstration purposes. In practice, the topology can be more complex depending on the requirements of the experiment.

Make sure you thoroughly understand the process of building the topology and adapt it to your specific needs. -->
