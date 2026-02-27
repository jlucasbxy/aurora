# Lumi Challenge - API de Faturas de Energia

API backend em Node.js para:
- receber faturas de energia em PDF;
- extrair dados estruturados com LLM (Claude/Anthropic);
- persistir os dados em PostgreSQL;
- disponibilizar consultas paginadas e dashboards agregados (energia e financeiro).

## Sumário
- [Tecnologias e decisões arquiteturais](#tecnologias-e-decisões-arquiteturais)
- [Arquitetura da aplicação](#arquitetura-da-aplicação)
- [Pré-requisitos](#pré-requisitos)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Setup e instalação](#setup-e-instalação)
- [Execução](#execução)
- [Scripts disponíveis](#scripts-disponíveis)
- [API](#api)
- [Rate limit, segurança e limites](#rate-limit-segurança-e-limites)
- [Fluxo de dados](#fluxo-de-dados)
- [Testes e qualidade](#testes-e-qualidade)
- [Limitações conhecidas](#limitações-conhecidas)

## Tecnologias e decisões arquiteturais

### Framework HTTP: Fastify
**Escolha:** `fastify` + plugins oficiais (`helmet`, `cors`, `multipart`, `rate-limit`).

**Por quê:**
- alta performance para APIs I/O-bound;
- ecossistema de plugins estável para segurança e upload;
- tipagem forte com TypeScript, reduzindo erros em controllers/rotas.

### ORM e banco: Prisma + PostgreSQL
**Escolha:** `@prisma/client` + Prisma migrations + PostgreSQL.

**Por quê:**
- modelo de dados tipado e consistente com o domínio;
- migrations versionadas para previsibilidade de ambiente;
- agregações (`sum`) usadas nos endpoints de dashboard.

### Precisão monetária: `DECIMAL(15,2)`
**Escolha:** campos financeiros persistidos como `Decimal @db.Decimal(15, 2)` no PostgreSQL.

**Por quê:**
- valores monetários não devem usar ponto flutuante binário (`float/double`) por risco de erro de arredondamento;
- `DECIMAL(15,2)` garante precisão decimal adequada para moeda (2 casas) com faixa confortável para valores agregados;
- o banco mantém consistência de cálculo financeiro em somas/agrupamentos.

### Cálculo no backend: `decimal.js`
**Escolha:** uso de `decimal.js` em [process-invoice-data.use-case.ts](/home/jlucasbx/code/challenges/lumi-challenge/src/application/use-cases/invoices/process-invoice-data.use-case.ts).

**Por quê:**
- JavaScript `number` usa IEEE 754, podendo gerar imprecisão em operações como soma/subtração de decimais;
- `decimal.js` evita erros acumulados antes da persistência;
- os campos derivados (`totalValueWithoutGD`, `gdSavings`, consumo total) são calculados de forma determinística.

### Estratégia de índices (PostgreSQL)
**Contexto:** consultas principais filtram por `clientNumber`, por `clientNumber + referenceMonth` e, potencialmente, por `referenceMonth` isolado.

**Decisão técnica:**
- índice composto `@@index([clientNumber, referenceMonth])` é o principal para consultas por cliente e por cliente+mês;
- pela regra de **leftmost-prefix**, esse índice também atende consultas por `clientNumber` sozinho;
- para consultas por `referenceMonth` sozinho, é necessário índice dedicado `@@index([referenceMonth])`.

Tabela de cobertura:

```text
┌───────────────────────────────┬──────────────────────────────────────────────────┐
│            Filter             │                    Index used                    │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ clientNumber only             │ (clientNumber, referenceMonth) — leftmost prefix │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ clientNumber + referenceMonth │ (clientNumber, referenceMonth) — full match      │
├───────────────────────────────┼──────────────────────────────────────────────────┤
│ referenceMonth only           │ (referenceMonth)                                  │
└───────────────────────────────┴──────────────────────────────────────────────────┘
```

Observação: quando a estratégia inclui `@@index([referenceMonth])`, o índice simples `@@index([clientNumber])` tende a ficar redundante, já que o composto cobre esse filtro com coluna líder em `clientNumber`.

### Cache: Redis (Repository Decorator)
**Escolha:** `ioredis` com `CachedInvoiceRepository` encapsulando o repositório Prisma.

**Por quê:**
- reduz custo de queries repetidas (lista e dashboards);
- invalidação centralizada ao salvar nova fatura;
- sem acoplar cache à camada de aplicação/domínio.

### LLM: Claude via Anthropic SDK
**Escolha:** `@anthropic-ai/sdk` com `messages.parse` e schema Zod de saída.

**Por quê:**
- extração estruturada diretamente validada por schema;
- menor pós-processamento manual;
- estratégia de retry para falhas transitórias e tratamento explícito para rate limit.

#### Escolha do modelo (custo-benefício)
O projeto usa `claude-haiku-4-5` (configurado em `src/infrastructure/providers/claude-llm.provider.ts`) por ser uma opção mais econômica para a tarefa de extração de campos de documento, mantendo boa latência e qualidade para um caso objetivo de parsing.

Em termos práticos:
- para payloads frequentes de PDF, o custo por requisição tende a ser menor que modelos maiores;
- a tarefa aqui é estruturada e restrita (campos definidos), o que favorece modelos mais leves;
- modelos maiores podem melhorar robustez em casos muito ambíguos, mas com custo significativamente maior.

#### Prompt de extração e "skill" do modelo
O sistema utiliza um prompt específico no caso de uso de extração para induzir o comportamento esperado:
- extrair apenas campos explicitamente presentes;
- não inferir/calcular valores;
- retornar JSON estritamente estruturado.

No contexto de LLM, "skill" significa uma capacidade operacional induzida por instrução e contexto, não um módulo treinado separadamente dentro da aplicação.  
Ou seja, a "skill de extração" é o comportamento que o modelo executa quando recebe:
- instruções claras (prompt),
- o documento (PDF),
- e um formato de saída obrigatório (schema Zod via `messages.parse`).

Isso reduz alucinação, melhora consistência e torna a saída validável programaticamente.

### Validação: Zod
**Escolha:** validação de:
- variáveis de ambiente;
- query params/entrada HTTP;
- estrutura de resposta da LLM.

**Por quê:**
- falha rápida com mensagens claras;
- padronização de validação em todo o projeto.

## Arquitetura da aplicação

Organização em camadas:
- `src/domain`: entidades, value objects, regras e erros de domínio.
- `src/application`: DTOs, interfaces e casos de uso.
- `src/infrastructure`: HTTP, banco, provider de LLM, serviços e config.
- `src/main`: composição via factories e bootstrap do servidor.

Padrões principais:
- **Clean architecture (adaptada)** para isolamento de regras de negócio.
- **Repository pattern** para abstrair persistência.
- **Decorator** para cache (`CachedInvoiceRepository`).
- **Factories/singletons** para composição e ciclo de vida de dependências.

## Pré-requisitos
- Node.js **24.x** (recomendado)
- npm
- Docker + Docker Compose (fluxo principal de setup)
- Chave da API da Anthropic (obrigatória para upload com extração LLM)

## Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Variáveis necessárias:

| Variável | Obrigatória | Exemplo | Descrição |
|---|---|---|---|
| `NODE_ENV` | Não (default: `production`) | `development` | Ambiente de execução (`development`, `test`, `production`) |
| `PORT` | Sim | `3000` | Porta HTTP da API |
| `HOST` | Sim | `0.0.0.0` | Host de bind do Fastify |
| `DATABASE_URL` | Sim | `postgresql://lumi:lumi@localhost:5432/lumi_db?schema=public` | Conexão PostgreSQL |
| `REDIS_URL` | Sim | `redis://:lumi_cache@localhost:6379` | Conexão Redis (cache + rate-limit) |
| `ANTHROPIC_API_KEY` | Sim | `sk-ant-...` | Chave de acesso ao Claude |
| `ENABLE_SWAGGER` | Não (default: `false`) | `true` | Habilita Swagger fora de `production` |
| `MAX_FILE_SIZE_KB` | Não (default: `50`) | `50` | Tamanho máximo de upload de arquivo em KB |
| `RATE_LIMIT_INVOICE_LIST_MAX` | Não (default: `100`) | `100` | Máximo de requisições para `GET /invoices` |
| `RATE_LIMIT_INVOICE_LIST_WINDOW` | Não (default: `15 minutes`) | `15 minutes` | Janela de tempo para `GET /invoices` |
| `RATE_LIMIT_INVOICE_UPLOAD_MAX` | Não (default: `10`) | `10` | Máximo de requisições para `POST /invoices/upload` |
| `RATE_LIMIT_INVOICE_UPLOAD_WINDOW` | Não (default: `15 minutes`) | `15 minutes` | Janela de tempo para `POST /invoices/upload` |
| `RATE_LIMIT_DASHBOARD_MAX` | Não (default: `100`) | `100` | Máximo de requisições para `GET /dashboard/*` |
| `RATE_LIMIT_DASHBOARD_WINDOW` | Não (default: `15 minutes`) | `15 minutes` | Janela de tempo para `GET /dashboard/*` |

Exemplo (`.env`):

```dotenv
PORT=3000
HOST=0.0.0.0
DATABASE_URL="postgresql://lumi:lumi@localhost:5432/lumi_db?schema=public"
REDIS_URL="redis://:lumi_cache@localhost:6379"
ANTHROPIC_API_KEY="your-api-key-here"
ENABLE_SWAGGER=true
MAX_FILE_SIZE_KB=50
RATE_LIMIT_INVOICE_LIST_MAX=100
RATE_LIMIT_INVOICE_LIST_WINDOW="15 minutes"
RATE_LIMIT_INVOICE_UPLOAD_MAX=10
RATE_LIMIT_INVOICE_UPLOAD_WINDOW="15 minutes"
RATE_LIMIT_DASHBOARD_MAX=100
RATE_LIMIT_DASHBOARD_WINDOW="15 minutes"
```

> Segurança: nunca versione chaves reais. Se uma chave foi exposta, gere uma nova e revogue a anterior.

## Setup e instalação

### 1) Instalar dependências Node

```bash
npm install
```

### 2) Subir infraestrutura com Docker (Postgres + Redis)

```bash
docker compose up -d
```

Serviços esperados:
- PostgreSQL em `localhost:5432`
- Redis em `localhost:6379` (senha `lumi_cache`)

### 3) Aplicar migrations do banco

```bash
npx prisma migrate deploy
```

### 4) Gerar client Prisma

```bash
npx prisma generate
```

## Execução

### Desenvolvimento

```bash
npm run dev
```

Servidor sobe em:
- `http://localhost:3000` (ou conforme `HOST`/`PORT`)

### Produção (build + start)

```bash
npm run build
npm run start
```

## Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Executa em modo desenvolvimento com watch |
| `npm run build` | Gera Prisma Client e compila TS para `dist/` |
| `npm run start` | Inicia versão compilada |
| `npm run test` | Executa testes unitários com Vitest |
| `npm run test:watch` | Testes em modo watch |
| `npm run typecheck` | Checagem de tipos sem emitir build |
| `npm run lint` | Lint com Biome |
| `npm run format` | Formata código com Biome |
| `npm run check` | Checagem geral do Biome |

## API

Base URL:

```text
http://localhost:3000/api/v1
```

Documentação OpenAPI/Swagger:
- UI interativa: `http://localhost:3000/docs`
- Especificação JSON: `http://localhost:3000/docs/json`
- Em `NODE_ENV=production`, fica sempre desabilitado (ignora `ENABLE_SWAGGER`).
- Fora de `production`, depende de `ENABLE_SWAGGER=true`.

### 1) Upload de fatura

`POST /invoices/upload`

#### Exemplo de requisição

```bash
curl -X POST "http://localhost:3000/api/v1/invoices/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@./invoice.pdf;type=application/pdf"
```

#### Exemplo de resposta `201`

```json
{
  "id": "0195ff17-2c4e-73a5-8e1e-6b1f4d1882ba",
  "clientNumber": "1234567890",
  "referenceMonth": "JAN/2024",
  "electricEnergyQty": 120,
  "electricEnergyValue": 85.42,
  "sceeEnergyQty": 60,
  "sceeEnergyValue": 41.10,
  "compensatedEnergyQty": 30,
  "compensatedEnergyValue": -22.50,
  "publicLightingContrib": 12.34,
  "electricEnergyConsumption": 180,
  "compensatedEnergy": 30,
  "totalValueWithoutGD": 138.86,
  "gdSavings": -22.50,
  "createdAt": "2026-02-26T22:10:45.000Z"
}
```

#### Exemplos de erro

Arquivo ausente:

```json
{
  "code": "NO_FILE_PROVIDED",
  "message": "No file provided"
}
```

Arquivo maior que 50 KB:

```json
{
  "code": "FILE_TOO_LARGE",
  "message": "File or request body exceeds the 50 KB limit"
}
```

Tipo inválido (não-PDF):

```json
{
  "code": "UNSUPPORTED_MEDIA_TYPE",
  "message": "Only PDF files are accepted"
}
```

Fatura duplicada para o mesmo cliente e mês/ano (`409`):

```json
{
  "code": "INVOICE_ALREADY_EXISTS",
  "message": "Invoice already exists for this client and reference month"
}
```

Regra de unicidade:
- Não é permitido cadastrar duas faturas com o mesmo par `clientNumber` + `referenceMonth`.

### 2) Listagem de faturas (paginada)

`GET /invoices`

Query params opcionais:
- `clientNumber`: string com **10 dígitos**
- `referenceMonth`: formato **`MMM/YYYY`** (ex.: `JAN/2024`)
- `cursor`: UUIDv7 do último item retornado
- `limit`: inteiro entre **1** e **100**

#### Exemplo de requisição

```bash
curl "http://localhost:3000/api/v1/invoices?clientNumber=1234567890&referenceMonth=JAN/2024&limit=10"
```

#### Exemplo de resposta `200`

```json
{
  "data": [
    {
      "id": "0195ff17-2c4e-73a5-8e1e-6b1f4d1882ba",
      "clientNumber": "1234567890",
      "referenceMonth": "JAN/2024",
      "electricEnergyQty": 120,
      "electricEnergyValue": 85.42,
      "sceeEnergyQty": 60,
      "sceeEnergyValue": 41.10,
      "compensatedEnergyQty": 30,
      "compensatedEnergyValue": -22.50,
      "publicLightingContrib": 12.34,
      "electricEnergyConsumption": 180,
      "compensatedEnergy": 30,
      "totalValueWithoutGD": 138.86,
      "gdSavings": -22.50,
      "createdAt": "2026-02-26T22:10:45.000Z"
    }
  ],
  "nextCursor": null,
  "hasNextPage": false
}
```

#### Exemplo de erro `400` (query inválida)

```json
{
  "code": "INVALID_QUERY_PARAMS",
  "message": "Client number must be exactly 10 digits"
}
```

### 3) Dashboard de energia

`GET /dashboard/:clientNumber/energy`

Query params opcionais:
- `dateStart`: `MMM/YYYY`
- `dateEnd`: `MMM/YYYY`

#### Exemplo de requisição

```bash
curl "http://localhost:3000/api/v1/dashboard/1234567890/energy?dateStart=JAN/2024&dateEnd=DEZ/2024"
```

#### Exemplo de resposta `200`

```json
{
  "electricEnergyConsumption": 1380,
  "compensatedEnergy": 260
}
```

#### Exemplo de erro `404`

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "No energy data found for the given query"
}
```

### 4) Dashboard financeiro

`GET /dashboard/:clientNumber/financial`

Query params opcionais:
- `dateStart`: `MMM/YYYY`
- `dateEnd`: `MMM/YYYY`

#### Exemplo de requisição

```bash
curl "http://localhost:3000/api/v1/dashboard/1234567890/financial?dateStart=JAN/2024&dateEnd=DEZ/2024"
```

#### Exemplo de resposta `200`

```json
{
  "totalValueWithoutGD": 1287.15,
  "gdSavings": -215.90
}
```

#### Exemplo de erro `404`

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "No financial data found for the given query"
}
```

## Rate limit, segurança e limites

- Rate limit por rota:
  - `GET /invoices`: **100 req / 15 min**
  - `POST /invoices/upload`: **10 req / 15 min**
  - `GET /dashboard/*`: **100 req / 15 min**
- Todos os limites de rate limit são configuráveis via variáveis de ambiente `RATE_LIMIT_*`.
- Body limit global: **1 MB**
- Upload por arquivo: **50 KB** (configurável via `MAX_FILE_SIZE_KB`)
- Apenas `application/pdf` é aceito no upload
- `helmet` habilitado
- CORS configurado com `origin: false` (API fechada para browsers por padrão)

**Sobre o limite de upload (50 KB):**
O valor padrão de 50 KB foi definido com base em testes com faturas reais — nenhuma ultrapassou 40 KB, então 50 KB oferece uma margem de segurança confortável. Esse limite é configurável via `MAX_FILE_SIZE_KB` porque o tamanho dos PDFs pode variar conforme a distribuidora ou o layout da fatura. Manter um limite adequado é importante do ponto de vista de segurança: restringe ataques de negação de serviço (DoS) por envio de arquivos grandes que consomem memória, banda e processamento do servidor, e reduz a superfície de exploração de payloads maliciosos embutidos em PDFs superdimensionados.

Exemplo de erro de rate limit:

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Retry in 2 minutes."
}
```

## Fluxo de dados

1. Cliente envia PDF em `/invoices/upload`.
2. API valida arquivo (presença, tamanho, mimetype).
3. Documento é enviado ao Claude com prompt de extração estruturada.
4. Resposta é validada por schema Zod.
5. Valores são processados (normalização e cálculos derivados).
6. Entidade de domínio é validada e persistida no PostgreSQL.
7. Cache Redis relevante é invalidado.
8. Endpoints de listagem/dashboard consultam banco com camada de cache.

## Testes e qualidade

Executar:

```bash
npm run test
npm run typecheck
npm run lint
```

Cobertura atual do projeto (unitária) inclui:
- parsers HTTP;
- mappers;
- value objects e entidade de domínio;
- use cases de invoices e dashboard;
- controllers.

## Limitações conhecidas

- O sucesso da extração depende da legibilidade/estrutura do PDF enviado.
- Não há endpoint de healthcheck dedicado no momento.
- CORS está fechado por padrão, exigindo ajuste explícito para uso por front-end web em outro domínio.
- O fluxo de upload depende de chave Anthropic válida e saldo/limite da conta.
