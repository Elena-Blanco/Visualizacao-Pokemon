async function loadData() {
    try {
        const data = await d3.csv('data/pokedex_(Update_05.20).csv', d => {
            return {
                pokedex_number: +d.pokedex_number,
                name: d.name,
                generation: +d.generation,
                status: d.status,
                species: d.species,
                type_1: d.type_1,
                type_2: d.type_2 || null,
                height_m: +d.height_m,
                weight_kg: +d.weight_kg,
                hp: +d.hp,
                attack: +d.attack,
                defense: +d.defense,
                sp_attack: +d.sp_attack,
                sp_defense: +d.sp_defense,
                speed: +d.speed,
                total_points: +d.total_points,
                catch_rate: +d.catch_rate,
                percentage_male: +d.percentage_male
            };
        });

        console.log('Dados carregados:', data.length, 'Pokémon');
        
        const generations = [...new Set(data.map(d => d.generation))].sort((a, b) => a - b);
        const types = [...new Set([...data.map(d => d.type_1), ...data.map(d => d.type_2).filter(t => t)])].sort();
        const statuses = [...new Set(data.map(d => d.status))].sort();

        populateFilterDropdown('generation-filter', generations);
        populateFilterDropdown('type-filter', types);
        populateFilterDropdown('status-filter', statuses);
        
        return data;
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        return [];
    }
}

function populateFilterDropdown(id, values) {
    const dropdown = document.getElementById(id);

    const allOption = dropdown.options[0];

    dropdown.innerHTML = '';
    dropdown.appendChild(allOption);

    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        dropdown.appendChild(option);
    });
}

