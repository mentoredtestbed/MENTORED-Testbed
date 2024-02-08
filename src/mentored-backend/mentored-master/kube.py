from kubernetes import client, config
import yaml
from time import sleep
import json


class Kube:

    def __init__(self):
        config.load_kube_config()
        active = config.list_kube_config_contexts()[1]
        self.namespace = active['context']['namespace']
        self.core_api = client.CoreV1Api()
        self.app_api = client.AppsV1Api()
        self.pods = []
        self.nodes = []
        for node in self.core_api.list_node().items:
            if not 'master' in node.metadata.name:
                self.nodes.append(node.metadata.name)

    def apply(self, path, kind, server_ips=False):
        file = yaml.load(open(path), Loader=yaml.FullLoader)

        if kind == 'deployment':
            if server_ips:
                target_cni = file['spec']['template']['metadata']['annotations']['targetServerCNI']
                replace_server_ip = server_ips[target_cni]
                for container in file['spec']['template']['spec']['containers']:
                    for i, var_env in enumerate(container['env']):
                        if var_env['name'] == 'SERVER':
                            var_env['value'] = replace_server_ip
            
            return self.app_api.create_namespaced_deployment(body=file, namespace=self.namespace)
        elif kind =='pod':
            return self.core_api.create_namespaced_pod(body=file, namespace=self.namespace)

    def delete(self, actor, kind):
        if kind == 'deployment':
            return self.app_api.delete_namespaced_deployment(namespace=self.namespace, name=actor)
        else:
            return self.core_api.delete_namespaced_pod(namespace=self.namespace, name=actor)

    def update_data(self):
        self.pods = self.core_api.list_namespaced_pod(namespace=self.namespace).items

    def get_info(self, actor):
        info = []
        ac = list(filter(lambda x: actor in x.metadata.labels['actor'], self.pods))
        for node in self.nodes:
            runner = list(filter(lambda x: node in x.spec.node_name, ac))
            scaled = len(runner)
            running = len(list(filter(lambda x: 'Running' in x.status.phase, runner)))
            data = {'actor': actor, 'node': node, 'scaled': scaled, 'running': running}
            info.append(data)
        return info

    def guarantee_execution(self, actor):
        self.update_data()
        ac = list(filter(lambda x: actor in x.metadata.labels['actor'], self.pods))
        while len(list(filter(lambda x: 'Running' in x.status.phase, ac))) == 0:
            sleep(1)
            self.update_data()
            ac = list(filter(lambda x: actor in x.metadata.labels['actor'], self.pods))

    def get_name(self, actor):
        ac = list(filter(lambda x: actor in x.metadata.labels['actor'], self.pods))
        return ac[0].metadata.name
    
    # def get_pod_ip(self, actor, net_interface_name=None):
    def get_pod_ip(self, actor):
        '''
        net_interface attributes:
        - 'name'
        - 'ips'
        - 'default'
        - 'mac'
        - 'dns'
        '''
        ac = list(filter(lambda x: actor in x.metadata.labels['actor'], self.pods))
        # return ac[0].status.pod_ip

        net_interface_list = json.loads(
            ac[0].metadata.annotations['k8s.v1.cni.cncf.io/network-status']
        )

        ip_list = {}
        for net_interface in net_interface_list:
            if 'default' in net_interface and net_interface['default']:
                ip_list['default'] = net_interface['ips'][0]
            else:
                cni_name = net_interface['name'].split("/")[-1]
                ip_list[cni_name] = net_interface['ips'][0]

        return ip_list

        # print(net_interface_list)
        # for net_interface in net_interface_list:
        #     if net_interface_name is None:
        #         if net_interface['default']:
        #             return net_interface['ips'][0]
        #     elif net_interface_name == net_interface['name']:
        #         return net_interface['ips'][0]
        # exit()

    def get_target_server_cni(self, actor):
        '''
        net_interface attributes:
        - 'name'
        - 'ips'
        - 'default'
        - 'mac'
        - 'dns'
        '''
        ac = list(filter(lambda x: actor in x.metadata.labels['actor'], self.pods))
        # return ac[0].status.pod_ip

        targetServerCNI = json.loads(
            ac[0].metadata.annotations['targetServerCNI']
        )


        return targetServerCNI