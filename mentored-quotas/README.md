Arquivos YAML para configurar as cotas de recursos no MENTORED Testbed, divididos pelos três perfis: **Ouro**, **Prata** e **Bronze**. Além de limitar o número de pods e a quantidade de recursos por pod (CPU e memória), também limitamos quais nós podem ser usados, usando o `NodeSelector` para restringir os nodes com base no perfil.

#### 1. **ResourceQuota**:
   - **`ResourceQuota`** limita o uso total de recursos em um namespace. Ele é utilizado para garantir que um conjunto de recursos (como pods, memória, CPU, etc.) não seja excedido dentro de um namespace.
   - A chave **`hard`** especifica os limites máximos:
     - **`pods`**: Limita o número de pods que podem ser criados no namespace.
     - Como estamos configurando o número máximo de pods por perfil, definimos valores diferentes para cada perfil (90 para Ouro, 60 para Prata, e 30 para Bronze).

#### 2. **LimitRange**:
   - **`LimitRange`** define os limites de recursos (memória e CPU) para os containers dentro dos pods. Ele ajuda a garantir que os containers não consumam mais recursos do que o esperado.
   - O **`max`** especifica os limites máximos que os containers podem consumir, enquanto o **`min`** define os valores mínimos que os containers precisam solicitar para serem agendados corretamente.
   - Para cada perfil:
     - **Ouro**: Limita os containers a **4 GiB de RAM** e **4 CPUs** por container.
     - **Prata**: Limita os containers a **2 GiB de RAM** e **2 CPU** por container.
     - **Bronze**: Limita os containers a **1 GiB de RAM** e **1 CPUs** por container.

#### 3. **NodeSelector**:
   - **`NodeSelector`** é utilizado para restringir a execução de pods em nodes específicos com base em rótulos.
   - O **`matchExpressions`** permite que você defina que apenas os nodes com um rótulo específico sejam usados para os pods daquele perfil.
   - Cada perfil (Ouro, Bronze e Prata) será associado a um conjunto de nodes que possuem o rótulo correspondente:
     - Para **Ouro**, a chave **`profile=ouro`** deve estar presente no nó.
     - Para **Prata**, a chave **`profile=prata`** deve estar presente no nó.
     - Para **Bronze**, a chave **`profile=bronze`** deve estar presente no nó.
   - Isso garante que, por exemplo, os pods do perfil Ouro serão alocados apenas em nodes com o rótulo **`profile=ouro`**.

### Como funciona:
- **Perfil Ouro**:
  - Permite até **90 pods** no namespace.
  - Limite de **4 CPUs** e **4 GiB de RAM** por container (máximo).
  - Restringe os pods a nodes com o rótulo **`profile=ouro`**.

- **Perfil Prata**:
  - Limita até **60 pods** no namespace.
  - Limite de **2 CPU** e **2 GiB de RAM** por container (máximo).
  - Restringe os pods a nodes com o rótulo **`profile=prata`**.

- **Perfil Bronze**:
  - Limita até **30 pods** no namespace.
  - Limite de **1 CPUs** e **1 GiB de RAM** por container (máximo).
  - Restringe os pods a nodes com o rótulo **`profile=bronze`**.

Esses arquivos YAML permitem que sejam definidas cotas claras e específicas para diferentes perfis de uso, garantindo que os recursos do cluster sejam utilizados de maneira eficiente e que os pods sejam alocados apenas em nodes adequados aos requisitos de cada perfil.