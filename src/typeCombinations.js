function createTypeCombinationsChart(data, filters) {
    const container = d3.select('#type-combinations-chart');
    container.html('');
    
    const filteredData = filterData(data, filters);
    
    const typeCombinations = d3.rollup(
        filteredData.filter(d => d.type_2), 
        v => v.length,
        d => d.type_1,
        d => d.type_2
    );

    const chartData = [];
    typeCombinations.forEach((secondaryTypes, primaryType) => {
        secondaryTypes.forEach((count, secondaryType) => {
            chartData.push({
                primaryType,
                secondaryType,
                count
            });
        });
    });

    chartData.sort((a, b) => b.count - a.count);

    const topCombinations = chartData.slice(0, 15);

    const margin = {top: 30, right: 30, bottom: 100, left: 60};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
        .domain(topCombinations.map(d => `${d.primaryType}/${d.secondaryType}`))
        .range([0, width])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(topCombinations, d => d.count)])
        .range([height, 0]);
    
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Combinação de Tipos');
    
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .text('Quantidade de Pokémon');
    
    const tooltip = createTooltip();
    
    topCombinations.forEach((d, i) => {
        const gradientId = `gradient-${i}`;
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');
        
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', getTypeColor(d.primaryType));
        
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', getTypeColor(d.secondaryType));

        svg.append('rect')
            .attr('class', 'bar')
            .attr('x', x(`${d.primaryType}/${d.secondaryType}`))
            .attr('y', y(d.count))
            .attr('width', x.bandwidth())
            .attr('height', height - y(d.count))
            .attr('fill', `url(#${gradientId})`)
            .on('mouseover', function(event) {
                showTooltip(tooltip, `
                    <strong>Combinação de Tipos</strong><br>
                    Primário: ${createTypeBadge(d.primaryType)}<br>
                    Secundário: ${createTypeBadge(d.secondaryType)}<br>
                    Quantidade: ${d.count} Pokémon
                `, event);
            })
            .on('mouseout', () => hideTooltip(tooltip));
    });
    
    const rareCombinations = chartData.slice(-5).reverse();
    
    const rareInfo = container.append('div')
        .attr('class', 'rare-combinations-info')
        .style('margin-top', '10px')
        .style('font-size', '12px');
    
    rareInfo.append('p')
        .style('font-weight', 'bold')
        .text('Combinações mais raras:');
    
    const rareList = rareInfo.append('ul')
        .style('padding-left', '20px');
    
    rareCombinations.forEach(d => {
        rareList.append('li')
            .html(`${createTypeBadge(d.primaryType)} / ${createTypeBadge(d.secondaryType)}: ${d.count} Pokémon`);
    });
}

