/**
 * Visualização: Distribuição de Status por Categoria
 */

function createStatusDistributionChart(data, filters) {
    // Limpar o container
    const container = d3.select('#status-distribution-chart');
    container.html('');
    
    // Filtrar os dados
    const filteredData = filterData(data, filters);
    
    // Categorizar os Pokémon
    const categorizedData = filteredData.map(d => ({
        ...d,
        category: getPokemonCategory(d)
    }));
    
    // Agrupar por categoria
    const categories = ['Normal', 'Sub-Lendário', 'Lendário', 'Mítico'];
    const statNames = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
    const statLabels = ['HP', 'Ataque', 'Defesa', 'Ataque Esp.', 'Defesa Esp.', 'Velocidade'];
    
    // Calcular estatísticas por categoria
    const statsByCategory = categories.map(category => {
        const pokemonInCategory = categorizedData.filter(d => d.category === category);
        const stats = {};
        
        statNames.forEach(stat => {
            stats[stat] = d3.mean(pokemonInCategory, d => d[stat]) || 0;
        });
        
        return {
            category,
            stats,
            count: pokemonInCategory.length
        };
    });
    
    // Configurar dimensões
    const margin = {top: 30, right: 100, bottom: 70, left: 60};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    // Criar SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Preparar dados para o gráfico de radar
    const radarData = statsByCategory.map(d => {
        const values = statNames.map(stat => d.stats[stat]);
        return {
            category: d.category,
            values,
            count: d.count
        };
    });
    
    // Configurar o gráfico de radar
    const radarRadius = Math.min(width, height) / 2;
    const radarCenter = { x: width / 2, y: height / 2 };
    
    // Escala para os eixos do radar
    const maxValue = d3.max(radarData, d => d3.max(d.values)) * 1.1;
    const rScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, radarRadius]);
    
    // Ângulos para cada eixo
    const angleSlice = (Math.PI * 2) / statNames.length;
    
    // Cores para as categorias
    const color = d3.scaleOrdinal()
        .domain(categories)
        .range(['#78C850', '#A8B820', '#F08030', '#F85888']);
    
    // Desenhar os círculos de fundo
    const axisGrid = svg.append('g')
        .attr('class', 'axis-grid')
        .attr('transform', `translate(${radarCenter.x},${radarCenter.y})`);
    
    const levels = 5;
    
    // Círculos de nível
    for (let j = 0; j < levels; j++) {
        const levelFactor = radarRadius * ((j + 1) / levels);
        
        axisGrid.selectAll('.level')
            .data([1])
            .enter()
            .append('circle')
            .attr('class', 'level')
            .attr('r', levelFactor)
            .style('fill', 'none')
            .style('stroke', '#CDCDCD')
            .style('stroke-opacity', 0.5);
        
        // Rótulos de nível
        if (j === levels - 1) {
            axisGrid.selectAll('.level-label')
                .data([1])
                .enter()
                .append('text')
                .attr('class', 'level-label')
                .attr('x', 5)
                .attr('y', -levelFactor + 5)
                .attr('dy', '0.35em')
                .style('font-size', '10px')
                .text(Math.round(maxValue * (j + 1) / levels));
        }
    }
    
    // Criar os eixos
    const axis = axisGrid.selectAll('.axis')
        .data(statNames)
        .enter()
        .append('g')
        .attr('class', 'axis');
    
    // Linhas dos eixos
    axis.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d, i) => rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y2', (d, i) => rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2))
        .style('stroke', '#CDCDCD')
        .style('stroke-width', '1px');
    
    // Rótulos dos eixos
    axis.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('x', (d, i) => rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('y', (d, i) => rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .text((d, i) => statLabels[i]);
    
    // Criar tooltip
    const tooltip = createTooltip();
    
    // Função para desenhar o caminho do radar
    const radarLine = d3.lineRadial()
        .radius(d => rScale(d))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);
    
    // Desenhar os polígonos do radar
    const radarWrapper = svg.selectAll('.radar-wrapper')
        .data(radarData)
        .enter()
        .append('g')
        .attr('class', 'radar-wrapper')
        .attr('transform', `translate(${radarCenter.x},${radarCenter.y})`);
    
    // Área do radar
    radarWrapper.append('path')
        .attr('class', 'radar-area')
        .attr('d', d => radarLine(d.values))
        .style('fill', d => color(d.category))
        .style('fill-opacity', 0.5)
        .style('stroke', d => color(d.category))
        .style('stroke-width', '2px')
        .on('mouseover', function(event, d) {
            d3.select(this).style('fill-opacity', 0.7);
            
            const statsHtml = statNames.map((stat, i) => 
                `${statLabels[i]}: ${Math.round(d.values[i])}`
            ).join('<br>');
            
            showTooltip(tooltip, `
                <strong>${d.category}</strong><br>
                ${statsHtml}<br>
                Quantidade: ${d.count} Pokémon
            `, event);
        })
        .on('mouseout', function() {
            d3.select(this).style('fill-opacity', 0.5);
            hideTooltip(tooltip);
        });
    
    // Pontos do radar
    radarWrapper.selectAll('.radar-circle')
        .data((d, i) => d.values.map((value, j) => ({value, index: j, category: d.category})))
        .enter()
        .append('circle')
        .attr('class', 'radar-circle')
        .attr('r', 4)
        .attr('cx', (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr('cy', (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
        .style('fill', d => color(d.category))
        .style('fill-opacity', 0.8);
    
    // Criar legenda
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width + 20}, 0)`);
    
    const legendItems = legend.selectAll('.legend-item')
        .data(categories)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);
    
    legendItems.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => color(d));
    
    legendItems.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .text(d => d);
}

