# Strapi application

## Projeto criado utilizando

https://strapi.io/documentation/developer-docs/latest/getting-started/quick-start.html

## Ambiente de desenvolvimento

### Para iniciar o ambiente

**Passo 1**: Subir o banco de dados, para isso na pasta `tools/database` temos o aquivo `docker-compose.yml` que ao ser executado sobe o postgres.

```script
docker-compose up -d
```

**Passo2**: Subir o dump inicial do banco utilizando o seguinte comando dentro da pasta "tools/database":

```script
pg_restore --host localhost --port 5432 --username wongames --dbname wongames ./wongames-initial.dump
```
Utilizar a senha "wongames123"

**Passo 3**: Instalar as dependências na aplicação

```script
yarn
```

**Passo 4**: Subir a aplicação

```script
yarn develop
```

**Passo 5**

Acessar a url http://localhost:1337/admin/auth/login e utilizar as credenciais abaixo para entrar na aplicação:
- **E-mail**: ricardo.almendro.ruiz@gmail.com
- **Senha**: Wongames2021
