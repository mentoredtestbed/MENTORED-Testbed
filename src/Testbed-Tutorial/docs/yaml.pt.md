O Kubernetes é uma plataforma amplamente utilizada em simulações de redes e cibersegurança, permitindo a automação da implantação, dimensionamento e gerenciamento de aplicações em ambientes de teste. Ele oferece um ambiente flexível e escalável para a execução de experimentos de ataques cibernéticos, como DDoS (Distributed Denial of Service), em contêineres. Com o Kubernetes, é possível criar, implantar e escalar rapidamente ambientes de teste para avaliar a resiliência de sistemas e aplicações diante de ameaças cibernéticas. Para isso, os arquivos YAML são usados para definir a configuração desses ambientes de teste, descrevendo de forma declarativa o estado desejado do sistema. A seguir, três arquivos YAML serão apresentados que representam um exemplo de cliente, atacante e servidor, respectivamente.

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

O arquivo de exemplo YAML`example_yaml_client` apresenta a definição de um conjunto de pods que atuarão como clientes, realizando requisições HTTP GET a um servidor web hospedado em outro pod. Aqui está uma análise detalhada do arquivo YAML:

> name: 'generic-client-go'
>
> Nome do deployment.

---

> persitent_volume_path: '/client_delay.csv'
>
> Aqui é onde os tempos de resposta das solicitações serão salvos em um arquivo CSV.

---

> replicas: '70'
>
> Serão criados pods que funcionarão como clientes.

---

> containers:
>
> Descrição do container.

---

> name: 'client-go'
>
> Nome do container.
---

> image: [ghcr.io/mentoredtestbed/generic-client:latest](ghcr.io/mentoredtestbed/generic-client:latest)
>
> A imagem Docker que será usada para criar este container.
---

> command:  ["/entry.sh"]
>
>   Comando de inicialização.
---

> args: ['python3', 'client_web_metrics.py', "1", "1"]
>
>   Estes são os argumentos passados para o script Python que realizará as solicitações web.
---

> env: Variáveis de ambiente.
>
>   - name: TIMEOUT_CMD 
>   - value: "300"
>
>     Timeout (em segundos) para cada solicitação HTTP GET.
>
>   - name: ADD_SERVER_IP_TO_COMMAND
>   - value: "true"
>
>     Indica se deve adicionar o endereço IP do servidor ao comando.
---

> resources: Recursos do container.
>
>   - requests: Define os recursos mínimos de que o container precisa.
>     - memory: "64Mi"
>     - cpu: "100m"
>
>       (64Mi de memória e 100m CPU).

>   - limits: Define os recursos máximos que o container pode usar.
>     - memory: "128M"
>     - cpu: "200m"
>
>       (128Mi de memória e 200m CPU).

---

> region:  'ids-go'
>
> Este é o nome da região onde os pods serão executados no Cluster Nacional RNP.

Essa configuração garantirá que 70 pods clientes sejam executados, cada um realizando requisições HTTP GET em um intervalo de 1 segundo durante 300 segundos a um servidor web hospedado em outro lugar, e registrando os tempos de resposta dessas requisições em um arquivo CSV no caminho especificado.

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

O arquivo YAML `example_yaml_botnet`  define um conjunto de pods que funcionarão como atacantes, realizando um ataque de negação de serviço distribuído (DDoS). Aqui está uma análise detalhada do conteúdo:

> name: 'generic-botnet-pb'
>
> Nome do deployment.

---

> persitent_volume_path: "/MENTORED_IP_LIST.yaml"
>
> Este é o caminho onde uma lista de IPs monitorados será armazenada.

---

> replicas: 10
>
> Serão criados 10 pods que realizarão os ataques.

---

> containers:
>
> Descrição dos containers.

---

> name: 'botnet-pb'
>
> Nome do container.

---

> image: [ghcr.io/mentoredtestbed/generic-botnet:latest](ghcr.io/mentoredtestbed/generic-botnet:latest)
>
> A imagem Docker que será usada para criar este container, configurado com a ferramenta de ataque DDoS, Slowloris.

---

> command: ["/entry.sh"]
>
> Comando de inicialização.

---

> args: ["slowloris", "-p", "80"]
>
> Argumentos do comando. Configura o ataque Slowloris, especificando a porta 80 como alvo.

---

> env: Variáveis de ambiente.
>
>   - name: PROTOCOL 
>   - value: "ICMP"
>
>     Define o protocolo a ser usado nos ataques.
>
>   - name: TIMEOUT_CMD
>   - value: "180"
>
>     Timeout (em segundos) para cada solicitação.
>
>   - name: TIME_WAIT_START 
>   - value: "60"
>
>     Tempo de espera antes do início do ataque (em segundos).
>
>   - name: ADD_SERVER_IP_TO_COMMAND
>   - value: "true"
>
>     Indica se deve adicionar o endereço IP do servidor ao comando.

---

> resources: Recursos do container.
>
>   - requests: Define os recursos mínimos de que o container precisa.
>     - memory: "64Mi"
>     - cpu: "100m"
>
>       (64Mi de memória e 100m CPU).

>   - limits: Define os recursos máximos que o container pode usar.
>     - memory: "128M"
>     - cpu: "200m"
>
>       (128Mi de memória e 200m CPU).

---

> region: 'ids-go'
>
> Este é o nome da região onde os pods serão executados no Cluster Nacional RNP.


Este arquivo YAML define uma botnet que realizará ataques de negação de serviço usando o método Slowloris sobre o protocolo ICMP. Cada um dos 10 pods gerados será responsável por executar esses ataques. Os resultados e configurações dos ataques serão registrados em um volume persistente localizado em "/MENTORED_IP_LIST.yaml".


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

O arquivo "exemplo_yaml_servidor" descreve a configuração de um experimento em redes e cibersegurança, utilizando o Kubernetes. Aqui apresentamos uma descrição do conteúdo do arquivo:

> name: 'slowloris_experiment'
>
> Nome do deployment.

---

> nodeactors: Descrição do Pod.
>
> - name: 'na-server'
>
>   Nome do Pod.

---

> persitent_volume_path: "/app/packets.pcap"
>
> Arquivo de captura que será salvo automaticamente.

---

> replicas: 1
>
> Número de pods.

---

> containers: Descrição do container.
>
> - name: 'tshark'
>
>   Nome do container responsável pela captura de tráfego.

---

> image: ghcr.io/mentoredtestbed/mentored-tshark
>
> Imagem do container responsável pela captura de tráfego.

---

> command: ["/entry.sh"]
>
> Comando de inicialização.

---

> args: ["tshark", "-i", "net1", "-x", "-w", "packets.pcap"]
>
> Argumentos do comando. Configura o Tshark para capturar pacotes na interface 'net1' e salvar em um arquivo pcap.

---

> env: Variáveis de ambiente.
>
> - name: TIMEOUT_CMD
>   value: "300"
>
>   Timeout (em segundos) para a execução do pod.

---

> name: 'server'
>
> Nome do container.

---

> image: ghcr.io/mentoredtestbed/generic-apache-flask-webserver:latest
>
> Esta imagem Docker contém um servidor Apache com o framework Flask.

---

> ports: 
>
>   - containerPort: 80
>
> Esta é a porta que será exposta pelo servidor web.

---

> resources: Recursos do container.
>
> - requests: Define os recursos mínimos de que o container precisa.
>     - memory: "1G"
>     - cpu: "1"
>
>     (1G de memória e 1 CPU).
>
> - limits: Define os recursos máximos que o container pode usar.
>     - memory: "2G"
>     - cpu: "2"
>
>     (2G de memória e 2 CPUs).

---

> region: 'ids-pe'
>
> Este é o nome da região geográfica onde os pods serão executados dentro do Cluster Nacional, especificado no formato de Unidade Federativa.

Em resumo, o arquivo descreve um experimento onde um pod captura o tráfego de rede utilizando a ferramenta Tshark e o salva em um arquivo pcap, enquanto outro pod executa um servidor web utilizando a imagem do Apache com o framework Flask, expondo-o na porta 80. Ambos os pods serão executados na região de Pernambuco dentro do Cluster Nacional.
