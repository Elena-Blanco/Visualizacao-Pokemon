/**
 * Utilitários para o sistema de visualização de dados Pokémon
 */

// Cores para os tipos de Pokémon
const TYPE_COLORS = {
    'Normal': '#A8A878',
    'Fire': '#F08030',
    'Water': '#6890F0',
    'Electric': '#F8D030',
    'Grass': '#78C850',
    'Ice': '#98D8D8',
    'Fighting': '#C03028',
    'Poison': '#A040A0',
    'Ground': '#E0C068',
    'Flying': '#A890F0',
    'Psychic': '#F85888',
    'Bug': '#A8B820',
    'Rock': '#B8A038',
    'Ghost': '#705898',
    'Dragon': '#7038F8',
    'Dark': '#705848',
    'Steel': '#B8B8D0',
    'Fairy': '#EE99AC'
};

// Função para criar um tooltip
function createTooltip() {
    return d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
}

// Função para mostrar o tooltip
function showTooltip(tooltip, html, event) {
    tooltip
        .html(html)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 30) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 0.9);
}

// Função para esconder o tooltip
function hideTooltip(tooltip) {
    tooltip
        .transition()
        .duration(500)
        .style('opacity', 0);
}

// Função para calcular a força total de um Pokémon (soma de todos os status)
function calculateTotalStrength(pokemon) {
    return pokemon.hp + pokemon.attack + pokemon.defense + 
           pokemon.sp_attack + pokemon.sp_defense + pokemon.speed;
}

// Função para calcular a força ofensiva de um Pokémon
function calculateOffensiveStrength(pokemon) {
    return pokemon.attack + pokemon.sp_attack + pokemon.speed;
}

// Função para calcular a força defensiva de um Pokémon
function calculateDefensiveStrength(pokemon) {
    return pokemon.hp + pokemon.defense + pokemon.sp_defense;
}

// Função para obter a cor de um tipo
function getTypeColor(type) {
    return TYPE_COLORS[type] || '#999999';
}

// Função para criar um badge HTML para um tipo
function createTypeBadge(type) {
    return `<span class="type-badge" style="background-color: ${getTypeColor(type)}">${type}</span>`;
}

// Função para truncar texto longo
function truncateText(text, maxLength = 20) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Função para filtrar os dados com base nos filtros selecionados
function filterData(data, filters) {
    return data.filter(d => {
        let matchesGeneration = filters.generation === 'all' || d.generation == filters.generation;
        let matchesType = filters.type === 'all' || d.type_1 === filters.type || d.type_2 === filters.type;
        let matchesStatus = filters.status === 'all' || d.status === filters.status;
        
        return matchesGeneration && matchesType && matchesStatus;
    });
}

// Função para atualizar todos os gráficos
function updateAllCharts() {
    // Esta função será definida no main.js
}

// Função para criar uma legenda
function createLegend(container, items, colorScale) {
    const legend = container.append('div')
        .attr('class', 'legend');
    
    items.forEach(item => {
        const legendItem = legend.append('div')
            .attr('class', 'legend-item');
        
        legendItem.append('div')
            .attr('class', 'legend-color')
            .style('background-color', colorScale(item));
        
        legendItem.append('span')
            .text(item);
    });
}

// Função para determinar a categoria do Pokémon com base no status
function getPokemonCategory(pokemon) {
    if (pokemon.status.includes('Legendary')) {
        return 'Lendário';
    } else if (pokemon.status.includes('Sub-Legendary')) {
        return 'Sub-Lendário';
    } else if (pokemon.status.includes('Mythical')) {
        return 'Mítico';
    } else {
        return 'Normal';
    }
}

// Função para formatar números com separadores de milhares
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

