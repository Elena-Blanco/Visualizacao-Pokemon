function createTopPokemonChart(data, filters, mode = 'offensive') {

    const container = d3.select('#top-pokemon-chart');
    container.html('');
    
    const filteredData = filterData(data, filters);
    
    let strengthFunction;
    let strengthLabel;
    
    if (mode === 'offensive') {
        strengthFunction = calculateOffensiveStrength;
        strengthLabel = 'Força Ofensiva';
    } else {
        strengthFunction = calculateDefensiveStrength;
        strengthLabel = 'Força Defensiva';
    }
    
    const dataWithStrength = filteredData.map(d => ({
        ...d,
        strength: strengthFunction(d)
    }));
    
    
    const topPokemon = dataWithStrength
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 10);
    
    
    const margin = {top: 30, right: 30, bottom: 70, left: 150};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    
    const x = d3.scaleLinear()
        .domain([0, d3.max(topPokemon, d => d.strength)])
        .range([0, width]);
    
    const y = d3.scaleBand()
        .domain(topPokemon.map(d => d.name))
        .range([0, height])
        .padding(0.2);
    
    const color = d3.scaleOrdinal()
        .domain(topPokemon.map(d => d.type_1))
        .range(topPokemon.map(d => getTypeColor(d.type_1)));
    
    
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 30)
        .text(strengthLabel);

    const tooltip = createTooltip();
    
    svg.selectAll('.bar')
        .data(topPokemon)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => y(d.name))
        .attr('width', d => x(d.strength))
        .attr('height', y.bandwidth())
        .attr("fill", d => getTypeColor(d.type_1))
        .on('mouseover', function(event, d) {
            showTooltip(tooltip, `
                <strong>${d.name}</strong><br>
                ${createTypeBadge(d.type_1)} ${d.type_2 ? createTypeBadge(d.type_2) : ''}<br>
                ${strengthLabel}: ${d.strength}<br>
                HP: ${d.hp}<br>
                Ataque: ${d.attack}<br>
                Defesa: ${d.defense}<br>
                Ataque Especial: ${d.sp_attack}<br>
                Defesa Especial: ${d.sp_defense}<br>
                Velocidade: ${d.speed}
            `, event);
        })
        .on('mouseout', () => hideTooltip(tooltip));

    svg.selectAll('.bar-label')
        .data(topPokemon)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.strength) + 5)
        .attr('y', d => y(d.name) + y.bandwidth() / 2)
        .attr('dy', '.35em')
        .text(d => d.strength);
}

function setupTopPokemonButtons(data, filters) {
    document.getElementById('offensive-btn').addEventListener('click', function() {
        document.getElementById('offensive-btn').classList.add('active');
        document.getElementById('defensive-btn').classList.remove('active');
        createTopPokemonChart(data, filters, 'offensive');
    });
    
    document.getElementById('defensive-btn').addEventListener('click', function() {
        document.getElementById('offensive-btn').classList.remove('active');
        document.getElementById('defensive-btn').classList.add('active');
        createTopPokemonChart(data, filters, 'defensive');
    });
}