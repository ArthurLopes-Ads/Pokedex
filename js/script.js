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
      if (!response.ok) throw new Error("Erro ao buscar contagem");
      const data = await response.json();
      if (data.count) {
        totalCountSpan.textContent = data.count.toLocaleString("pt-BR");
      } else {
        totalCountSpan.textContent = "1000+";
      }
    } catch (e) {
      console.error("Erro ao buscar contagem:", e);
      totalCountSpan.textContent = "1000+";
    }
  };

  const createPokemonCard = (pokemonData) => {
    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    // Validações para dados seguros
    if (!pokemonData || !pokemonData.types || pokemonData.types.length === 0) {
      return; // Pula pokémon inválido
    }

    // Descobre o tipo primário para definir a cor
    const mainType = pokemonData.types[0].type.name;
    const themeColor = typeColors[mainType] || "#aeb5c0"; // Cor fallback

    // Busca a arte oficial (grande) com fallbacks
    let mainImage =
      pokemonData.sprites?.other?.["official-artwork"]?.front_default;
    if (!mainImage) {
      mainImage = pokemonData.sprites?.front_default;
    }
    if (!mainImage) {
      mainImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`;
    }

    // Tenta pegar a mini sprite, com fallbacks
    let miniSprite =
      pokemonData.sprites?.versions?.["generation-viii"]?.icons?.front_default;
    if (!miniSprite) {
      miniSprite = pokemonData.sprites?.front_default;
    }
    if (!miniSprite) {
      miniSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`;
    }

    // Define a cor como uma variável CSS inline para ser usada no style.css
    card.style.setProperty("--type-color", themeColor);

    // Capitalize name
    const capitalizedName =
      pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);

    card.innerHTML = `
      <span class="poke-id">#${String(pokemonData.id).padStart(3, "0")}</span>
      <div class="poke-img-container">
        <div class="poke-circle-bg"></div>
        <img src="${mainImage}" alt="${pokemonData.name}" class="poke-main-img" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png'">
      </div>
      <div class="poke-footer">
        <div class="poke-info">
          <h3 class="poke-name">${capitalizedName}</h3>
          <span class="poke-type">${mainType}</span>
        </div>
        <img src="${miniSprite}" alt="${pokemonData.name} icon" class="poke-mini-sprite" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png'">
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

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("Nenhum Pokémon encontrado");
      }

      const fetchPromises = data.results.map((pokemon) =>
        fetch(pokemon.url)
          .then((res) => {
            if (!res.ok) throw new Error(`Erro ao buscar ${pokemon.name}`);
            return res.json();
          })
          .catch((err) => {
            console.error(`Erro ao carregar ${pokemon.name}:`, err);
            return null; // Retorna null se houver erro
          }),
      );

      const allPokemonData = await Promise.all(fetchPromises);
      // Filtra null values (pokémons que falharam) e cria cards apenas dos válidos
      allPokemonData.filter(Boolean).forEach(createPokemonCard);

      currentOffset += limit; // Prepara para a próxima página
    } catch (error) {
      console.error("Erro ao carregar Pokémons:", error);
      pokemonList.innerHTML += `<p style="color: #fb6c6c; text-align: center; width: 100%;">Erro ao carregar Pokémons. Tente novamente.</p>`;
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

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Não encontrado");
        }
        throw new Error(`Erro na API: ${response.status}`);
      }

      const pokemonData = await response.json();

      if (!pokemonData) {
        throw new Error("Dados inválidos recebidos");
      }

      createPokemonCard(pokemonData);
    } catch (error) {
      console.error("Erro na busca:", error);
      pokemonList.innerHTML = `<p style="color: #fb6c6c; text-align: center; width: 100%;">Pokémon não encontrado :(</p>`;
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
