<!-- Primeiro, o pesquisador deve estabelecer qual topologia será necessária para seu experimento. Neste exemplo, uma topologia simples será construída para fins de demonstração. No código abaixo, será criada uma topologia que consiste em dois pods interconectados usando o software iperf. O primeiro pod, denominado "na-server", será conectado ao IDS-SC e atuará como servidor para a comunicação entre os pods. O segundo pod, denominado "lan-2-0", terá uma réplica denominada "lan-2-1" e será conectado ao IDS-MG, desempenhando o papel de um cliente para o software iperf. -->

Aqui está um exemplo do arquivo YAML com a topologia:

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
1.  Nesta parte, você deve adicionar a definição de um pod do Kubernetes, criado por você


No código YAML, você pode ver que as informações nele contidas são usadas para criar a topologia. O YAML descreve os diferentes elementos, como experimentos, atores de nó e suas configurações, regiões e outras propriedades relevantes para a criação da topologia.

O exemplo consiste nos seguintes itens:

- 'name': nome do experimento;
- 'nodeactors': nós da topologia. O usuário deve inserir pelo menos um nó;
- '- name': Nome que identifica o nó-ator;
- 'replicas': Número de réplicas;
- 'image': Imagem usada pelos pods;
- 'imagePullPolicy': Diz ao Kubernetes para extrair a imagem do registro;
- 'command' (comando): Comando usado para manter um contêiner ativo
- 'privileged': Permissão atribuída ao pod
- 'region': Nome de um trabalhador no IDS. Se for "auto", o serviço identificará automaticamente um trabalhador para instanciar os contêineres;
- "topology": criar um OVS (Open Virtual Switch) para cada região usada. Todos os nós em uma região terão um link para seu OVS na interface de rede chamada "ovs-link".

Essas são as informações básicas para a criação da topologia no arquivo YAML. É importante ajustar os valores conforme necessário para seu experimento.

Lembre-se de que este é apenas um exemplo simples para fins de demonstração. Na prática, a topologia pode ser mais complexa, dependendo dos requisitos do experimento.

Certifique-se de entender completamente o processo de criação da topologia e de adaptá-la às suas necessidades específicas. -->
