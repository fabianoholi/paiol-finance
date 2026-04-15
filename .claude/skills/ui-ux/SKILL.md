---
name: ui-ux
description: Regras globais de UI/UX para diagramação de interfaces no projeto Paiol Finance. Use sempre que criar, alterar ou revisar telas, componentes visuais, hooks de apresentação, títulos (H1/H2) e subtítulos. Aplica checagens obrigatórias de quebra de linha, hierarquia tipográfica e legibilidade.
---

# UI/UX — Regras Globais do Projeto

Este skill define regras **GLOBAIS** de UI/UX que devem ser aplicadas em **todo** trabalho de diagramação de interfaces neste repositório. Elas não são sugestões — são um checklist obrigatório antes de considerar qualquer mudança visual como concluída.

## Regra Global: Quebra de Linha em Títulos e Hooks

**Ao diagramar interfaces, sempre teste a quebra de linhas em títulos H1 e H2.**

- Nunca deixe uma **única palavra solta** em uma linha (efeito "órfã/viúva" tipográfica).
- Se a quebra natural do navegador produzir uma palavra isolada na última linha, **force a quebra** manualmente para equilibrar a apresentação.
- Analise cada título e subtítulo a cada projeto/alteração — a decisão de onde quebrar é **sempre** um ato de design, nunca deixada ao acaso do viewport.
- Faça esse **CHECK de leitura** obrigatoriamente em:
  1. **Hooks** (chamadas de atenção, frases-gancho, headlines)
  2. **Títulos** (H1, títulos de página, títulos de seção)
  3. **Subtítulos** (H2, H3, deks, linhas de apoio)

### Por que essa regra existe

Uma palavra solta numa linha quebra o ritmo de leitura, desequilibra a composição visual e transmite descuido editorial. Títulos bem diagramados comunicam hierarquia e profissionalismo — especialmente em um produto financeiro como o Paiol Finance, onde confiança é parte do UX.

## Checklist Obrigatório (aplicar a CADA mudança de UI)

Antes de marcar qualquer tarefa de UI como concluída:

- [ ] Li em voz alta cada **hook**, **título** e **subtítulo** da tela alterada?
- [ ] Verifiquei a quebra de linha em **largura desktop** (≥1024px)?
- [ ] Verifiquei a quebra de linha em **largura tablet** (~768px)?
- [ ] Verifiquei a quebra de linha em **largura mobile** (~375px)?
- [ ] Nenhum título termina com uma palavra solta em uma linha?
- [ ] Se havia palavra órfã, forcei a quebra com uma das técnicas abaixo?

## Técnicas para Forçar a Quebra

Escolha a técnica adequada ao contexto:

### 1. `<br>` explícito
Para quebras fixas que devem ocorrer independentemente do viewport.
```html
<h1>Controle total do seu<br>fluxo financeiro</h1>
```

### 2. `&nbsp;` (non-breaking space) entre as duas últimas palavras
Impede que a última palavra fique sozinha — elas quebram juntas.
```html
<h2>Organize seus gastos em minutos sem&nbsp;complicação</h2>
```

### 3. `white-space: nowrap` em span
Mantém um grupo de palavras sempre junto.
```html
<h1>Seu dinheiro, <span class="nowrap">seu controle</span></h1>
```

### 4. `text-wrap: balance` (CSS moderno)
Distribui o texto de forma equilibrada entre as linhas.
```css
h1, h2 {
  text-wrap: balance;
}
```

### 5. `max-width` / `ch` no contêiner do título
Controla o comprimento da linha para forçar quebras mais harmoniosas.
```css
h1 {
  max-width: 18ch;
}
```

## Quando aplicar

Esta regra vale para:

- Todas as telas em `index.html`, `manual.html`, `migrate.html`, `migrate2.html`
- Qualquer novo template/HTML adicionado ao projeto
- Componentes que recebem texto dinâmico (títulos de cards, headers de seção, etc.)
- Mensagens de estado, modais, toasts com título destacado
- Qualquer elemento semântico de `h1` a `h6` usado visualmente como título

## Fluxo de Aplicação

1. **Antes de diagramar**: identifique todos os H1, H2 e hooks da tela.
2. **Durante a diagramação**: aplique `text-wrap: balance` como padrão global no CSS.
3. **Após diagramar**: renderize em 3 larguras (mobile / tablet / desktop) e leia cada título.
4. **Se detectar palavra órfã**: escolha a técnica acima mais adequada e force a quebra.
5. **Valide novamente** nas 3 larguras antes de finalizar.

## Regra de Ouro

> Se você não leu os títulos e subtítulos da tela em pelo menos três larguras diferentes, o trabalho de UI/UX **não está concluído**.
