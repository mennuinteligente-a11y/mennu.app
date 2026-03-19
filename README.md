# MENNU Sistema de Cardápio Inteligente

App web em Next.js para gerar cardápio semanal offline, com receitas locais em JSON, lista de compras consolidada, estimativa de gastos 💰, histórico salvo em `localStorage` e escolha entre modo claro e modo escuro. Tudo sem API externa, com foco em leveza, rapidez e operação local.

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run test
```

## Estrutura

- `app/` páginas do App Router
- `components/` blocos de UI
- `lib/mealPlanner.ts` motor de geração, custo, variedade e exportação
- `lib/visuals.ts` helpers de ilustração local e formatação de moeda
- `data/recipes.json` base de receitas
- `data/items.json` catálogo de itens
- `data/prices.json` preços locais
- `tests/mealPlanner.test.ts` testes unitários

## Como editar receitas e preços

### Receitas
Edite `data/recipes.json`.

Cada receita possui:
- `id`
- `nome`
- `refeicao` (`cafe`, `almoco`, `jantar`)
- `tags` (`economia`, `equilibrio`, `praticidade`)
- `tempoMin`
- `ingredientes`
- `passos`
- `variacoes`
- `restricoes`

### Preços
Edite `data/prices.json`.

Campos:
- `itemId`
- `nome`
- `categoria`
- `precoPorUnidade`
- `unidadePadrao`
- `tamanhoUnidade`

## Publicar na Vercel

1. Suba o projeto para um repositório Git.
2. Importe esse repositório na Vercel.
3. Framework detectado: `Next.js`.
4. Comandos padrão:
   - Install: `npm install`
   - Build: `npm run build`
   - Output: automático
5. Deploy no plano free.

Como o app usa apenas JSON local e `localStorage`, não precisa configurar banco, variáveis de ambiente ou backend.

## Funcionalidades implementadas

- Geração de plano semanal de 7 dias
- Suporte para 1 a 6 pessoas
- Seleção de café, almoço, jantar ou combinações
- Filtro por tempo máximo
- Objetivo: economia, equilíbrio ou praticidade
- Restrições: sem lactose, sem carne, sem ovo
- Tema claro e escuro com persistência local
- Ilustrações locais em estilo desenho/emoji para os pratos
- Modo demo com Dia 1 almoço = arroz + feijão + omelete
- Dia 1 jantar no demo = sanduíche natural
- 3 variações por refeição
- Troca de variação com recálculo do custo total e da lista de compras
- Lista de compras agrupada por categoria
- Exportação CSV
- Lista copiável em texto
- Layout pronto para impressão
- Histórico local dos últimos 5 planos

## Checklist de aceitação

- [x] gera cardápio 7 dias conforme parâmetros
- [x] suporta 1–6 pessoas
- [x] lista de compras e custo mudam ao trocar variação
- [x] export CSV funciona
- [x] print funciona
- [x] inicia no modo claro
- [x] permite alternar para modo escuro
- [x] mostra ilustração local por receita

## Observações

- O loading simula ~750ms para sensação de processamento.
- O motor tenta baratear o plano se o orçamento passar de 10% do teto.
- Se ainda ficar caro, mostra aviso para reduzir refeições ou aumentar orçamento.


## Destaques desta versão
- Splash screen com logo e frases animadas
- Modais com custo fracionado e custo inicial de mercado
- Página detalhada de receita em `/receitas/[id]`
- Suporte a foto local em `public/recipes/<id>.jpg`
- Novo nome da marca: MENNU Sistema de Cardápio Inteligente
- Base ampliada para 45 receitas com mais regras de variedade
