/**
 * Visualização: Força Média por Tipo
 */

function createAvgStrengthByTypeChart(data, filters) {
    // Limpar o container
    const container = d3.select('#avg-strength-by-type-chart');
    container.html('');
    
    // Filtrar os dados
    const filteredData = filterData(data, filters);
    
    // Processar os dados para a visualização
    const typeStrengths = d3.rollup(
        filteredData,
        v => ({
            avgTotal: d3.mean(v, d => d.total_points),
            avgHP: d3.mean(v, d => d.hp),
            avgAttack: d3.mean(v, d => d.attack),
            avgDefense: d3.mean(v, d => d.defense),
            avgSpAttack: d3.mean(v, d => d.sp_attack),
            avgSpDefense: d3.mean(v, d => d.sp_defense),
            avgSpeed: d3.mean(v, d => d.speed),
            count: v.length
        }),
        d => d.type_1
    );
    
    // Converter para formato adequado para visualização
    const chartData = Array.from(typeStrengths, ([type, stats]) => ({
        type,
        avgTotal: stats.avgTotal,
        avgHP: stats.avgHP,
        avgAttack: stats.avgAttack,
        avgDefense: stats.avgDefense,
        avgSpAttack: stats.avgSpAttack,
        avgSpDefense: stats.avgSpDefense,
        avgSpeed: stats.avgSpeed,
        count: stats.count
    })).sort((a, b) => b.avgTotal - a.avgTotal);
    
    // Configurar dimensões
    const margin = {top: 30, right: 30, bottom: 100, left: 60};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    // Criar SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Criar escalas
    const x = d3.scaleBand()
        .domain(chartData.map(d => d.type))
        .range([0, width])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.avgTotal)])
        .range([height, 0]);
    
    const color = d3.scaleOrdinal()
        .domain(chartData.map(d => d.type))
        .range(chartData.map(d => getTypeColor(d.type)));
    
    // Criar eixos
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    // Adicionar título dos eixos
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Tipo');
    
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .text('Pontos Totais Médios');
    
    // Criar tooltip
    const tooltip = createTooltip();
    
    // Criar barras
    svg.selectAll('.bar')
        .data(chartData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.type))
        .attr('y', d => y(d.avgTotal))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.avgTotal))
        .attr('fill', d => color(d.type))
        .on('mouseover', function(event, d) {
            showTooltip(tooltip, `
                <strong>${d.type}</strong><br>
                Pontos Totais Médios: ${Math.round(d.avgTotal)}<br>
                HP: ${Math.round(d.avgHP)}<br>
                Ataque: ${Math.round(d.avgAttack)}<br>
                Defesa: ${Math.round(d.avgDefense)}<br>
                Ataque Especial: ${Math.round(d.avgSpAttack)}<br>
                Defesa Especial: ${Math.round(d.avgSpDefense)}<br>
                Velocidade: ${Math.round(d.avgSpeed)}<br>
                Quantidade: ${d.count} Pokémon
            `, event);
        })
        .on('mouseout', () => hideTooltip(tooltip));
    
    // Adicionar linha média
    const avgLine = d3.mean(chartData, d => d.avgTotal);
    
    svg.append('line')
        .attr('x1', 0)
        .attr('y1', y(avgLine))
        .attr('x2', width)
        .attr('y2', y(avgLine))
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    
    svg.append('text')
        .attr('x', width - 5)
        .attr('y', y(avgLine) - 5)
        .attr('text-anchor', 'end')
        .style('fill', 'red')
        .style('font-size', '12px')
        .text(`Média: ${Math.round(avgLine)}`);
}

