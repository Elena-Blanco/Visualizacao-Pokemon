/**
 * Visualização: Facilidade de Captura vs. Força
 */

function createCatchRateChart(data, filters) {
    // Limpar o container
    const container = d3.select('#catch-rate-chart');
    container.html('');
    
    // Filtrar os dados
    const filteredData = filterData(data, filters);
    
    // Adicionar a força total aos dados
    const dataWithStrength = filteredData.map(d => ({
        ...d,
        totalStrength: d.total_points
    }));
    
    // Configurar dimensões
    const margin = {top: 30, right: 30, bottom: 70, left: 60};
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
        .domain([0, d3.max(dataWithStrength, d => d.totalStrength)])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(dataWithStrength, d => d.catch_rate)])
        .range([height, 0]);
    
    const color = d3.scaleOrdinal()
        .domain([...new Set(dataWithStrength.map(d => d.type_1))])
        .range(d3.schemeCategory10);
    
    const radius = d3.scaleSqrt()
        .domain([0, d3.max(dataWithStrength, d => d.total_points)])
        .range([3, 10]);
    
    // Criar eixos
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    // Adicionar título dos eixos
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Força Total (Pontos)');
    
    svg.append('text')
        .attr('class', 'axis-title')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .text('Taxa de Captura');
    
    // Criar tooltip
    const tooltip = createTooltip();
    
    // Adicionar pontos
    svg.selectAll('.dot')
        .data(dataWithStrength)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.totalStrength))
        .attr('cy', d => y(d.catch_rate))
        .attr('r', d => radius(d.total_points))
        .attr('fill', d => getTypeColor(d.type_1))
        .attr('opacity', 0.7)
        .on('mouseover', function(event, d) {
            showTooltip(tooltip, `
                <strong>${d.name}</strong><br>
                ${createTypeBadge(d.type_1)} ${d.type_2 ? createTypeBadge(d.type_2) : ''}<br>
                Força Total: ${d.totalStrength}<br>
                Taxa de Captura: ${d.catch_rate}<br>
                Geração: ${d.generation}
            `, event);
        })
        .on('mouseout', () => hideTooltip(tooltip));
    
    // Adicionar linha de tendência
    if (dataWithStrength.length > 1) {
        // Calcular a linha de tendência usando regressão linear
        const xValues = dataWithStrength.map(d => d.totalStrength);
        const yValues = dataWithStrength.map(d => d.catch_rate);
        
        // Função para calcular a regressão linear
        const linearRegression = (x, y) => {
            const n = x.length;
            let sumX = 0;
            let sumY = 0;
            let sumXY = 0;
            let sumXX = 0;
            
            for (let i = 0; i < n; i++) {
                sumX += x[i];
                sumY += y[i];
                sumXY += x[i] * y[i];
                sumXX += x[i] * x[i];
            }
            
            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            
            return {slope, intercept};
        };
        
        const {slope, intercept} = linearRegression(xValues, yValues);
        
        // Desenhar a linha de tendência
        const x1 = d3.min(xValues);
        const y1 = slope * x1 + intercept;
        const x2 = d3.max(xValues);
        const y2 = slope * x2 + intercept;
        
        svg.append('line')
            .attr('x1', x(x1))
            .attr('y1', y(y1))
            .attr('x2', x(x2))
            .attr('y2', y(y2))
            .attr('stroke', 'red')
            .attr('stroke-width', 2);
        
        // Adicionar texto com o coeficiente de correlação
        const correlation = calculateCorrelation(xValues, yValues);
        
        svg.append('text')
            .attr('x', width - 10)
            .attr('y', 20)
            .attr('text-anchor', 'end')
            .style('font-size', '12px')
            .text(`Correlação: ${correlation.toFixed(2)}`);
    }
}

// Função para calcular o coeficiente de correlação de Pearson
function calculateCorrelation(x, y) {
    const n = x.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
        sumYY += y[i] * y[i];
    }
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return numerator / denominator;
}

