# MENTORED-Testbed
Da Modelagem à Experimentação - Predizendo e detectando ataques DDoS e zero-day. Projeto Temático FAPESP/MCTIC 2018/23098-0

# Bem vindo ao MENTORED *testbed*

O projeto MENTORED é um projeto cooperativo entre a Universidade Federal de Minas Gerais (UFMG), a Universidade Federal de Pernambuco (UFPE), a Universidade de São Paulo (USP), o Instituto Federal de Santa Catarina (IFSC), a Universidade do Vale do Itajaí e Rede Nacional de Pesquisa (RNP). Foi selecionado como projeto temático na chamada pública MCTIC/CGI/FAPESP 2018. O projeto tem os seguintes objetivos principais: 

- Identificar, modelar e avaliar comportamentos maliciosos relacionados à IoT; 
- Auxiliar na construção de soluções avançadas e coordenadas para possibilitar: prevenção, previsão, detecção e mitigação de ataques DDoS; 
- Fornecer à comunidade científica em Cibersegurança um testbed para permitir que pesquisadores experimentem suas soluções em relação a ataques DDoS.

 O WP4 tem como foco prover um ambiente controlado para experimentação (testbed) em cibersegurança, a fim de oferecer recursos para que os pesquisadores dos demais WPs, e mesmo da comunidade de segurança em geral, possam demonstrar a viabilidade de suas soluções para redes seguras e com escala realista. 

Este repositório contem as ferramentas desenvolvidas no WP4 e utilizadas para a condução dos experimentos em cibersegurança.
  
# Começando

Conculte o guia MENTORED para obter informações sobre a condução e desenvolvimento de um experimento.
Está demo também pode ajudar :link: https://www.youtube.com/watch?v=PzeDiObNOWY .
 
# Recursos

- Automatização da topologia de rede por meio de um código YAML.
- Exemplos de topologias.
- Imagens Docker pré configuradas.
- Um guia para novos usúarios.
  
O diretório *core* contem os códigos para a automatização da topologia utilizando o KNetLab através de um arquivo YAML, também é possivel encontrar exemplos de topologias.

O diretório *docker-images* contem as imagens Docker pré configuradas com a ferramentas necessárias para a execução do experimento.

# Projetos de código aberto relacionados

O KNetLab e uma iniciativa da GCI e consiste em uma ferramenta que permite a criacão de redes em contêineres utilizando princípios Cloud Native.
:link: https://git.rnp.br/cnar/knetlab

