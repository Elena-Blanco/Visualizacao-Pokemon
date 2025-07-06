function createTypesByGenerationChart(data, filters) {
    const container = d3.select('#types-by-generation-chart');
    container.html('');

    const filteredData = filterData(data, filters);

    const typesByGeneration = d3.rollup(
        filteredData,
        v => v.length,
        d => d.generation,
        d => d.type_1
    );

    const chartData = [];
    typesByGeneration.forEach((typeMap, generation) => {
        typeMap.forEach((count, type) => {
            chartData.push({
                generation,
                type,
                count
            });
        });
    });

    const generations = [...new Set(chartData.map(d => d.generation))].sort((a, b) => a - b);
    const types = [...new Set(chartData.map(d => d.type))].sort();

    const margin = {top: 30, right: 30, bottom: 70, left: 60};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
        .domain(generations)
        .range([0, width])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(d3.rollup(chartData, v => d3.sum(v, d => d.count), d => d.generation), d => d[1])])
        .range([height, 0]);
    
    const color = d3.scaleOrdinal()
        .domain(types)
        .range(types.map(type => getTypeColor(type)));
    
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `Gen ${d}`))
        .selectAll('text')
        .style('text-anchor', 'middle');
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 25)
        .text('Geração');
    
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .text('Quantidade de Pokémon');
    
    const tooltip = createTooltip();
    
    const stackedData = d3.stack()
        .keys(types)
        .value((data, key) => {
            const match = chartData.find(d => d.generation === data.generation && d.type === key);
            return match ? match.count : 0;
        })
        (generations.map(gen => ({generation: gen})));
    
    svg.append('g')
        .selectAll('g')
        .data(stackedData)
        .join('g')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .attr('x', d => x(d.data.generation))
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())
        .attr('class', 'bar')
        .on('mouseover', function(event, d) {
            const type = d3.select(this.parentNode).datum().key;
            const count = d[1] - d[0];
            showTooltip(tooltip, `
                <strong>Geração ${d.data.generation}</strong><br>
                Tipo: ${createTypeBadge(type)}<br>
                Quantidade: ${count} Pokémon
            `, event);
        })
        .on('mouseout', () => hideTooltip(tooltip));
    
    createLegend(container, types, color);
}