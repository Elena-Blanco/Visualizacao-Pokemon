function createStrongestPokemonChart(data, filters) {
    // Limpar o container
    const container = d3.select('#strongest-pokemon-chart');
    container.html('');

    // Filtrar os dados
    const filteredData = filterData(data, filters);

    // Encontrar o Pokémon mais forte por tipo e geração
    const strongestByTypeAndGen = d3.rollup(
        filteredData,
        v => {
            // Encontrar o Pokémon com maior total_points
            return v.reduce((strongest, current) => {
                return (current.total_points > strongest.total_points) ? current : strongest;
            });
        },
        d => d.type_1,
        d => d.generation
    );

    // Converter para formato adequado para visualização
    const chartData = [];
    strongestByTypeAndGen.forEach((genMap, type) => {
        genMap.forEach((pokemon, gen) => {
            chartData.push({
                type,
                generation: gen,
                name: pokemon.name,
                total_points: pokemon.total_points,
                type_2: pokemon.type_2
            });
        });
    });

    // Filtrar por geração selecionada
    let displayData = chartData;
    if (filters.generation !== 'all') {
        displayData = chartData.filter(d => d.generation == filters.generation);
    }

    // Filtrar por tipo selecionado
    if (filters.type !== 'all') {
        displayData = displayData.filter(d => d.type === filters.type);
    }

    // Ordenar por pontos totais
    displayData.sort((a, b) => b.total_points - a.total_points);

    // Limitar a 15 itens para melhor visualização
    if (displayData.length > 15) {
        displayData = displayData.slice(0, 15);
    }

    // Configurar dimensões - Ajustado para acomodar o texto mais longo
    const margin = {top: 30, right: 30, bottom: 70, left: 200};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

    // Criar SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Criar escalas
    const x = d3.scaleLinear()
        .domain([0, d3.max(displayData, d => d.total_points)])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(displayData.map(d => d.name)) 
        .range([0, height])
        .padding(0.2);

    // Criar eixos
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y)
            .tickFormat(d => {
                // Encontra os dados completos do Pokémon para pegar a geração
                const pokemonData = displayData.find(p => p.name === d);
                if (pokemonData) {
                    return `${pokemonData.name} (Gen ${pokemonData.generation})`;
                }
                return d;
            })
        )
        .selectAll('text')
        .style('text-anchor', 'end'); // Garante que o texto esteja alinhado à direita do tick

    // Adicionar título dos eixos
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 30)
        .text('Pontos Totais');

    // Criar tooltip
    const tooltip = createTooltip();

    // Criar barras com gradiente para Pokémon com tipo secundário
    displayData.forEach((d, i) => {
        let fill;

        if (d.type_2) {
            // Criar gradiente para Pokémon com tipo secundário
            const gradientId = `strongest-gradient-${i}`;
            const gradient = svg.append('defs')
                .append('linearGradient')
                .attr('id', gradientId)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', getTypeColor(d.type));

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', getTypeColor(d.type_2));

            fill = `url(#${gradientId})`;
        } else {
            fill = getTypeColor(d.type);
        }

        // Criar barra
        svg.append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', y(d.name))
            .attr('width', x(d.total_points))
            .attr('height', y.bandwidth())
            .attr('fill', fill)
            .on('mouseover', function(event) {
                showTooltip(tooltip, `
                    <strong>${d.name}</strong><br>
                    ${createTypeBadge(d.type)} ${d.type_2 ? createTypeBadge(d.type_2) : ''}<br>
                    Geração: ${d.generation}<br>
                    Pontos Totais: ${d.total_points}
                `, event);
            })
            .on('mouseout', () => hideTooltip(tooltip));
    });

    // Adicionar rótulos nas barras
    svg.selectAll('.bar-label')
        .data(displayData)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.total_points) + 5)
        .attr('y', d => y(d.name) + y.bandwidth() / 2)
        .attr('dy', '.35em')
        .text(d => d.total_points);

}