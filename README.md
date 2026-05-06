# PokedexWEB

PokedexWEB é uma pequena aplicação frontend que consome a API pública do PokeAPI para exibir cards de Pokémons com imagens, nomes e informações de tipo.

## O que o código faz

- Carrega o HTML básico em `index.html`.
- Estiliza a interface com `css/style.css`.
- Usa JavaScript em `js/script.js` para consumir a API do PokeAPI e criar cards dinamicamente.
- Mostra uma lista paginada de Pokémons, 10 por vez.
- Possui função de busca por nome ou ID de Pokémon.
- Exibe um contador total de Pokémons obtido da API.

## Estrutura do projeto

- `index.html`
  - Estrutura principal da aplicação.
  - Contém o campo de busca, o contador, o grid de cards e o botão de carregar mais.
  - Importa o CSS e o JavaScript.

- `css/style.css`
  - Define o visual do app em tema escuro.
  - Formata cards, layout responsivo, botões e estado de carregamento.

- `js/script.js`
  - Faz as requisições à API do PokeAPI.
  - Cria os cards dos Pokémons com imagens, nome, tipo e ID.
  - Garante fallback de imagens quando necessário.
  - Implementa paginação com o botão "Carregar mais".
  - Implementa busca por nome ou ID.

## Como funciona

1. O navegador abre `index.html`.
2. O JavaScript faz um `fetch` para `https://pokeapi.co/api/v2/pokemon?offset=...&limit=10`.
3. Para cada Pokémon retornado, ele busca os detalhes individuais e monta um card.
4. O card é inserido em `#pokemon-list`.
5. O botão "Carregar mais" aumenta o `offset` e carrega os próximos 10 Pokémons.
6. Ao pesquisar, o app pede o Pokémon pelo nome ou ID e mostra apenas o resultado encontrado.

## Como usar

1. Abra o projeto em um servidor local (por exemplo, `python -m http.server 8000`).
2. Acesse `http://localhost:8000` no navegador.
3. Use o campo de busca para procurar por nome ou ID.
4. Clique em "Carregar mais" para carregar mais Pokémons.

## Dependências

- Navegador moderno com suporte a `fetch` e `ES6`.
- Conexão com a internet para acessar a API do PokeAPI.

## Observações

- A aplicação depende diretamente da API pública do PokeAPI.
- O estilo e comportamento podem ser ajustados diretamente nos arquivos `css/style.css` e `js/script.js`.
