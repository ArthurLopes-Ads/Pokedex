document.addEventListener("DOMContentLoaded", () => {
  const pokemonList = document.getElementById("pokemon-list");
  const filterInput = document.getElementById("pokemon-filter");
  const applyFilterButton = document.getElementById("apply-filter");
  const loadMoreButton = document.getElementById("load-more");
  const loadingState = document.getElementById("loading");
  const totalCountSpan = document.getElementById("total-count");

  // Configurações de Paginação
  let currentOffset = 0;
  const limit = 10; // Carrega de 10 em 10, assim como na imagem
  let isSearching = false; // Flag para saber se estamos no modo de pesquisa

  // Dicionário de cores para os tipos
  const typeColors = {
    grass: "#48d0b0",
    fire: "#fb6c6c",
    water: "#76bdfe",
    bug: "#a8b820",
    normal: "#aeb5c0",
    poison: "#9f5bba",
    electric: "#ffd86f",
    ground: "#e2bf65",
    fairy: "#f4b1f4",
    fighting: "#c03028",
    psychic: "#ff6568",
    rock: "#b8a038",
    ghost: "#735797",
    ice: "#9fdef3",
    dragon: "#7038f8",
    dark: "#705848",
    steel: "#b7b7ce",
    flying: "#a98ff3",
  };

  // Pega o total de Pokémons na API
  const fetchTotalCount = async () => {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1");
      const data = await response.json();
      totalCountSpan.textContent = data.count;
    } catch (e) {
      totalCountSpan.textContent = "1000+";
    }
  };

  const createPokemonCard = (pokemonData) => {
    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    // Descobre o tipo primário para definir a cor
    const mainType = pokemonData.types[0].type.name;
    const themeColor = typeColors[mainType] || "#aeb5c0"; // Cor fallback

    // Busca a arte oficial (grande) e o ícone de geração 8 (pequeno no canto)
    const mainImage =
      pokemonData.sprites.other["official-artwork"].front_default;
    // Tenta pegar a mini sprite, se não tiver usa a sprite normal frontal
    const miniSprite =
      pokemonData.sprites.versions["generation-viii"]?.icons?.front_default ||
      pokemonData.sprites.front_default;

    // Define a cor como uma variável CSS inline para ser usada no style.css
    card.style.setProperty("--type-color", themeColor);

    card.innerHTML = `
      <span class="poke-id">#${pokemonData.id}</span>
      <div class="poke-img-container">
        <div class="poke-circle-bg"></div>
        <img src="${mainImage}" alt="${pokemonData.name}" class="poke-main-img">
      </div>
      <div class="poke-footer">
        <h3 class="poke-name">${pokemonData.name}</h3>
        <img src="${miniSprite}" alt="${pokemonData.name} icon" class="poke-mini-sprite">
      </div>
    `;

    pokemonList.appendChild(card);
  };

  const toggleLoading = (isLoading) => {
    if (isLoading) {
      loadingState.classList.remove("d-none");
    } else {
      loadingState.classList.add("d-none");
    }
  };

  const loadPokemons = async () => {
    toggleLoading(true);
    isSearching = false;
    loadMoreButton.style.display = "block"; // Mostra botão de carregar mais

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?offset=${currentOffset}&limit=${limit}`,
      );
      const data = await response.json();

      const fetchPromises = data.results.map((pokemon) =>
        fetch(pokemon.url).then((res) => res.json()),
      );

      const allPokemonData = await Promise.all(fetchPromises);
      allPokemonData.forEach(createPokemonCard);

      currentOffset += limit; // Prepara para a próxima página
    } catch (error) {
      alert("Erro ao carregar Pokémons.");
    } finally {
      toggleLoading(false);
    }
  };

  const searchPokemon = async () => {
    const query = filterInput.value.trim().toLowerCase();

    if (!query) {
      // Se limpou o input e clicou buscar, recarrega a lista inicial
      pokemonList.innerHTML = "";
      currentOffset = 0;
      loadPokemons();
      return;
    }

    toggleLoading(true);
    isSearching = true;
    loadMoreButton.style.display = "none"; // Esconde botão de carregar mais na busca
    pokemonList.innerHTML = ""; // Limpa a tela para mostrar só o resultado

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${query}`,
      );
      if (!response.ok) throw new Error("Não encontrado");

      const pokemonData = await response.json();
      createPokemonCard(pokemonData);
    } catch (error) {
      pokemonList.innerHTML = `<p style="color: white; text-align: center; width: 100%;">Pokémon não encontrado :(</p>`;
    } finally {
      toggleLoading(false);
    }
  };

  // Event Listeners
  loadMoreButton.addEventListener("click", loadPokemons);
  applyFilterButton.addEventListener("click", searchPokemon);

  filterInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") searchPokemon();
    // Se apagar todo o texto, volta ao normal automático
    if (event.target.value === "" && isSearching) {
      pokemonList.innerHTML = "";
      currentOffset = 0;
      loadPokemons();
    }
  });

  // Inicialização
  fetchTotalCount();
  loadPokemons();
});
