const filters = {
    generation: 'all',
    type: 'all',
    status: 'all'
};

function updateAllCharts(data) {
    createTypesByGenerationChart(data, filters);
    createAvgStrengthByTypeChart(data, filters);
    createTopPokemonChart(data, filters, document.getElementById('offensive-btn').classList.contains('active') ? 'offensive' : 'defensive');
    createCatchRateChart(data, filters);
    createTypeCombinationsChart(data, filters);
    createStatusDistributionChart(data, filters);
    createGenderChart(data, filters);
    createStrongestPokemonChart(data, filters);
}

function setupFilterEvents(data) {
    document.getElementById('generation-filter').addEventListener('change', function() {
        filters.generation = this.value;
        updateAllCharts(data);
    });
    
    document.getElementById('type-filter').addEventListener('change', function() {
        filters.type = this.value;
        updateAllCharts(data);
    });

    document.getElementById('status-filter').addEventListener('change', function() {
        filters.status = this.value;
        updateAllCharts(data);
    });

    document.getElementById('reset-filters').addEventListener('click', function() {
        document.getElementById('generation-filter').value = 'all';
        document.getElementById('type-filter').value = 'all';
        document.getElementById('status-filter').value = 'all';
        
        filters.generation = 'all';
        filters.type = 'all';
        filters.status = 'all';
        
        updateAllCharts(data);
    });
}

async function main() {
    try {
        console.log('Carregando dados...');
        const data = await loadData();
        
        if (data.length === 0) {
            console.error('Nenhum dado carregado.');
            return;
        }
        
        console.log('Configurando eventos...');
        setupFilterEvents(data);
        setupTopPokemonButtons(data, filters);
        
        console.log('Criando visualizações...');
        updateAllCharts(data);
        
        console.log('Sistema inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar o sistema:', error);
    }
}

document.addEventListener('DOMContentLoaded', main);