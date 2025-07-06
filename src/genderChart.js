function createGenderChart(data, filters) {
    const container = d3.select('#gender-chart');
    container.html('');

    const filteredData = filterData(data, filters);

    const genderCategories = [
        { name: 'Apenas Macho', range: [100, 100], color: '#6890F0' },
        { name: 'Maioria Macho', range: [66.7, 99.9], color: '#98D8D8' },
        { name: 'Equilibrado', range: [33.4, 66.6], color: '#A8A878' },
        { name: 'Maioria Fêmea', range: [0.1, 33.3], color: '#F85888' },
        { name: 'Apenas Fêmea', range: [0, 0], color: '#EE99AC' },
        { name: 'Sem Gênero', range: [-1, -1], color: '#B8B8D0' }
    ];

    const genderData = genderCategories.map(category => {
        let pokemonInCategory;
        
        if (category.name === 'Sem Gênero') {
            pokemonInCategory = filteredData.filter(d => isNaN(d.percentage_male));
        } else {
            pokemonInCategory = filteredData.filter(d => {
                const percentMale = d.percentage_male;
                return !isNaN(percentMale) && 
                       percentMale >= category.range[0] && 
                       percentMale <= category.range[1];
            });
        }
        
        return {
            category: category.name,
            count: pokemonInCategory.length,
            color: category.color
        };
    });

    const total = d3.sum(genderData, d => d.count);
    genderData.forEach(d => {
        d.percentage = (d.count / total) * 100;
    });

    const margin = {top: 30, right: 30, bottom: 30, left: 30};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    const color = d3.scaleOrdinal()
        .domain(genderData.map(d => d.category))
        .range(genderData.map(d => d.color));

    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    
    const outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const tooltip = createTooltip();

    const arcs = svg.selectAll('.arc')
        .data(pie(genderData))
        .enter()
        .append('g')
        .attr('class', 'arc');
    
    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => d.data.color)
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .on('mouseover', function(event, d) {
            showTooltip(tooltip, `
                <strong>${d.data.category}</strong><br>
                Quantidade: ${d.data.count} Pokémon<br>
                Porcentagem: ${d.data.percentage.toFixed(1)}%
            `, event);
        })
        .on('mouseout', () => hideTooltip(tooltip));

    const text = svg.selectAll('.label')
        .data(pie(genderData))
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('dy', '.35em');
    
    function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    text.attr('transform', function(d) {
        const pos = outerArc.centroid(d);
        pos[0] = radius * (midAngle(d) < Math.PI ? 1.1 : -1.1);
        return `translate(${pos})`;
    })
    .attr('text-anchor', function(d) {
        return midAngle(d) < Math.PI ? 'start' : 'end';
    })
    .text(function(d) {
        if (d.data.percentage < 3) return '';
        return `${d.data.category} (${d.data.percentage.toFixed(1)}%)`;
    })
    .style('font-size', '12px');

    const polyline = svg.selectAll('.polyline')
        .data(pie(genderData))
        .enter()
        .append('polyline');
    
    polyline.attr('points', function(d) {
        if (d.data.percentage < 3) return '';
        
        const pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos];
    })
    .style('fill', 'none')
    .style('stroke', '#999')
    .style('stroke-width', '1px');

    svg.append('text')
        .attr('class', 'chart-title')
        .attr('text-anchor', 'middle')
        .attr('y', -radius - 10)
        .text('Distribuição de Gênero dos Pokémon')
        .style('font-size', '16px')
        .style('font-weight', 'bold');
}

