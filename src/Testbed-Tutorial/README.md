# Rascunho Tutorial Mentored Testbed
 
- https://www.mkdocs.org
- https://pypi.org/project/mkdocs-i18n/

## Preparando o ambiente 

```bash
python3 -m venv venv
source venv/bin/activate

pip install mkdocs==1.6.0 mkdocs-material==9.5.21 mkdocs-static-i18n==1.2.3
```

[Veja aqui um script](https://ultrabug.github.io/mkdocs-static-i18n/setup/upgrading-to-1/) que ajuda a migrar o `mkdocs.yml` com o plugin `mkdocs-static-i18n` da versão 0.56 para a versão 1.2.3.



## Excutando o mkdocs em modo de desenvolvimento

```bash
mkdocs serve
```

## Compilando o site

O site compilado é gerado no diretório `site`.

```bash
mkdocs build
```
