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

function createTooltip() {
    return d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
}

function showTooltip(tooltip, html, event) {
    tooltip
        .html(html)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 30) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 0.9);
}

function hideTooltip(tooltip) {
    tooltip
        .transition()
        .duration(500)
        .style('opacity', 0);
}

function calculateTotalStrength(pokemon) {
    return pokemon.hp + pokemon.attack + pokemon.defense + 
           pokemon.sp_attack + pokemon.sp_defense + pokemon.speed;
}

function calculateOffensiveStrength(pokemon) {
    return pokemon.attack + pokemon.sp_attack + pokemon.speed;
}

function calculateDefensiveStrength(pokemon) {
    return pokemon.hp + pokemon.defense + pokemon.sp_defense;
}

function getTypeColor(type) {
    return TYPE_COLORS[type] || '#999999';
}

function createTypeBadge(type) {
    return `<span class="type-badge" style="background-color: ${getTypeColor(type)}">${type}</span>`;
}

function truncateText(text, maxLength = 20) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function filterData(data, filters) {
    return data.filter(d => {
        let matchesGeneration = filters.generation === 'all' || d.generation == filters.generation;
        let matchesType = filters.type === 'all' || d.type_1 === filters.type || d.type_2 === filters.type;
        let matchesStatus = filters.status === 'all' || d.status === filters.status;
        
        return matchesGeneration && matchesType && matchesStatus;
    });
}

function updateAllCharts() {
    // Esta função será definida no main.js
}

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

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

