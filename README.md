# Strapi application

<br/>

## Projeto criado utilizando

https://strapi.io/documentation/developer-docs/latest/getting-started/quick-start.html


<br/><br/>
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

Acessar a url http://localhost:1337/admin e utilizar as credenciais abaixo para entrar na aplicação:
- **E-mail**: ricardo.almendro.ruiz@gmail.com
- **Senha**: Wongames2021



<br/><br/>
## Popular tabelas

<br/>

### Opção 1
Podemos subir o dump "`wongames-populated.dump`" e já possuir muitos games, categorias, desenvolvedores, plataformas e publicadores cadastrados.

Para essa opção será necessário também descompactar o arquivo "`uploads.zip`" que se encontra na pasta tools para dentro da pasta "`public`" para que as imagens referentes aos games existentes no dump estejam disponíveis

<br/>

### Opção 2
Outra forma de popular as tabelas seria utilizando o endpoint "`/games/populate`" 

Para isso é necessário liberar o acesso aos endpoints nas configurações de segurança do painel de controle do Strapi:
- "populate" da collection "Game" na seção "Aplication"
- "upload" na seção "Upload"

```script
curl -X POST http://localhost:1337/games/populate
```

Para gerar dados com jogos a serem lançados o comando será
```script
curl -X POST http://localhost:1337/games/populate\?availability\=coming\&mediaType\=game\&page\=1\&sort\=popularity
```
