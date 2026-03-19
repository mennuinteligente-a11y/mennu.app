# README — Extrator de Famílias do MENNU

Este script lê o `recipes.json`, identifica todas as famílias culinárias únicas e gera dois arquivos:

- `recipe-families.json`  
  lista simples com as famílias únicas
- `recipe-families-report.json`  
  relatório detalhado com contagem, exemplos e caminho sugerido da imagem

## Onde salvar

Coloque o arquivo `extract-mennu-families.mjs` na raiz do projeto MENNU.

Exemplo:

```bash
MENNU/
├─ app/
├─ components/
├─ data/
│  └─ recipes.json
├─ extract-mennu-families.mjs
└─ package.json
```

## Como executar

No terminal, dentro da pasta do projeto:

```bash
node extract-mennu-families.mjs
```

## Resultado padrão

O script vai ler:

```bash
./data/recipes.json
```

E criar:

```bash
./data/recipe-families.json
./data/recipe-families-report.json
```

## Exemplo de saída simples

```json
[
  "bowl",
  "crepioca",
  "cuscuz",
  "mingau",
  "omelete",
  "sanduiche",
  "tapioca",
  "torrada"
]
```

## Aceita variações de estrutura

Ele funciona se o JSON estiver em um destes formatos:

### 1. Array direto

```json
[
  { "nome": "Omelete de queijo", "family": "omelete" }
]
```

### 2. Objeto com `receitas`

```json
{
  "receitas": [
    { "nome": "Omelete de queijo", "family": "omelete" }
  ]
}
```

### 3. Objeto com `recipes`

```json
{
  "recipes": [
    { "name": "Cheese omelette", "family": "omelete" }
  ]
}
```

## Também trata

- `family` ou `familia`
- espaços extras
- letras maiúsculas/minúsculas
- nomes com espaço, convertendo para `_`

Exemplo:

```json
{ "familia": "Massa Tomate" }
```

vira:

```json
"massa_tomate"
```

## Comando com caminho personalizado

```bash
node extract-mennu-families.mjs ./data/recipes.json ./data/recipe-families.json
```

## Próximo passo no MENNU

Depois disso, use a lista gerada para montar sua biblioteca de imagens em:

```bash
/public/recipes/families/
```

Exemplo:

```bash
/public/recipes/families/omelete.webp
/public/recipes/families/tapioca.webp
/public/recipes/families/massa_tomate.webp
```

Pronto. Uma pequena dose de organização antes do caos natural de qualquer app crescer.
