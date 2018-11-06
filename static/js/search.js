let activeFilters = []

let suggestedFilters = []

const maxFiltersFromCategory = 3;

const countries = Array.from(new Set(data.map(d => d.country)));

const states = Array.from(new Set(data.map(d => d.state)));

const cities = Array.from(new Set(data.map(d => d.city)));

const shapes = Array.from(new Set(data.map(d => d.shape)));

const now = new Date(Date.now());
     
const thisMonthStartDate = new Date(1900 + now.getYear(), now.getMonth(), 1);
const thisYearStartDate = new Date(1900 + now.getYear(), 0, 1);
const lastMonthStartDate = now.getMonth() == 0 ? new Date(1900 + now.getYear() - 1, 11, 1) : new Date(1900 + now.getYear(), now.getMonth() - 1, 1);
const lastYearStartDate = new Date(1900 + now.getYear() - 1, 0, 1);

const predefinedDateFilters = [
    {
        search: 'this month',
        display: 'This month',
        filter: x => x.raw_datetime >= thisMonthStartDate,
        isActive: false
    },    
    {
        search: 'this year',
        display: 'This year',
        filter: x => x.raw_datetime >= thisYearStartDate,
        isActive: false
    },
    {
        search: 'last month',
        display: 'Last month',
        filter: x => x.raw_datetime >= lastMonthStartDate && x.raw_datetime < thisMonthStartDate,
        isActive: false
    },
    {
        search: 'last year',
        display: 'Last year',
        filter: x => x.raw_datetime >= lastYearStartDate && x.raw_datetime < thisYearStartDate,
        isActive: false
    }
]

function getDateFilters(text) {
    if (!text || text.length < 2) {
        return Array.from(predefinedDateFilters);
    }
    let date = Date.parse(text);
    if (date) {
        let dateStr = dateFormat(date, 'mmm d,yyyy', false);
        return [
            {
                display: `Before ${dateStr}`,
                filter: x => x.raw_datetime < date
            },
            {
                display: `Before/on ${dateStr}`,
                filter: x => x.raw_datetime <= date
            },
            {
                display: `On ${dateStr}`,
                filter: x => x.raw_datetime === date
            },
            {
                display: `After ${dateStr}`,
                filter: x => x.raw_datetime > date
            },
            {
                display: `After/on ${dateStr}`,
                filter: x => x.raw_datetime >= date
            }
        ]
    }
    return predefinedDateFilters.filter(x => x.search.includes(text));
}

function getCountryFilters(text) {
    if (!text || text.length < 2) {
        return [ {
            display: 'Country is US',
            filter: x => x.country === 'us'
        }];
    }
    return countries.filter(c => c.includes(text)).map(c => ({
        display: `Country is ${c.toUpperCase()}`,
        filter: x => x.country === c
    }));
}

function getStateFilters(text) {
    if (!text || text.length < 2) {
        return [ {
            display: 'State is CA',
            filter: x => x.state === 'ca'
        }];
    }
    return states.filter(s => s.includes(text)).map(s => ({
        display: `State is ${s.toUpperCase()}`,
        filter: x => x.state === s
    }));
}

function getCityFilters(text) {
    if (!text || text.length < 2) {
        return [];
    }
    return cities.filter(c => c.includes(text)).map(c => ({
        display: `City is '${title(c)}'`,
        filter: x => x.city === c
    }));
}

function getShapeFilters(text) {
    if (!text || text.length < 2) {
        return [];
    }
    return shapes.filter(s => s.includes(text)).map(s => ({
        display: `Shape is ${title(s)}`,
        filter: x => x.shape === s
    }));
}

function getCommentFilters(text) {
    if (!text || text.length < 2) {
        return [];
    }
    return [{
        display: `Comment contains '${text}'`,
        filter: x => x.comments.toLowerCase().includes(text)
    }];
}

function getSuggestedFilters(text) {
    text = text ? text.trim() : '';
    text = text.toLowerCase();
    let dateFilters = getDateFilters(text);
    let countryFilters = getCountryFilters(text).slice(0, maxFiltersFromCategory);
    let stateFilters = getStateFilters(text).slice(0, maxFiltersFromCategory);
    let cityFilters = getCityFilters(text).slice(0, maxFiltersFromCategory);
    let shapeFilters = getShapeFilters(text).slice(0, maxFiltersFromCategory);
    let commentFilters = getCommentFilters(text).slice(0, maxFiltersFromCategory);
    return dateFilters.concat(countryFilters, stateFilters, cityFilters, shapeFilters, commentFilters);
}

function onRemoveFilter(filter) {
    filter.active = false;
    activeFilters.splice(activeFilters.indexOf(filter), 1);
    updateFilters();
    updateData();
}

function onSelectFilter(filter) {
    activeFilters.forEach(f => f.active = false);
    filter.active = true;
    activeFilters = [ filter ];
    updateFilters();
    updateData();
}

function onAddFilter(filter) {
    filter.active = true;
    activeFilters.push(filter);
    updateFilters();
    updateData();
}

function getAllFilters() {
    let allFilters = suggestedFilters.filter(sf => !activeFilters.some(af => af.display === sf.display));
    allFilters = activeFilters.concat(allFilters); 
    return allFilters;
}

function updateFilters() {
    let filters = getAllFilters();
    d3.selectAll('.filter-list .filter').remove();

    let selection = d3.select('.filter-list')
        .selectAll('.filter')
        .data(filters);

    let boxes = selection.enter()    
        .append('div')
        .attr('class', 'filter')        
        .classed('active', d => d.active)
    boxes.append('a')
        .attr('class', 'filter-text')
        .attr('href', d => d.active ? null : '#')
        .text(d => d.display)
        .filter(d => !d.active)
            .on('click', onSelectFilter);
    let actions = boxes.append('a')
        .attr('class', 'filter-action')
        .attr('href', '#')
        .append('img')
        .attr('src', 'static/images/add.svg');
    actions.filter(d => d.active)
        .on('click', onRemoveFilter);
    actions.filter(d => !d.active)
        .on('click', onAddFilter);
}

function getData() {
    if (!activeFilters.length) {
        return data;
    }
    return data.filter(d => activeFilters.every(af => af.filter(d)));
}

function title(str) {
    let words = str.split(' ');
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function updateData() {      
    let data = getData();

    let table = d3.select('.table-area>table');
    table.select('tbody').remove();

    let tbody = table.append('tbody');

    let rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    rows.append('td').text(d => dateFormat(d.raw_datetime, 'mmm dd,yyyy'));
    rows.append('td').text(d => title(d.city));
    rows.append('td').text(d => d.state.toUpperCase());
    rows.append('td').text(d => d.country.toUpperCase());
    rows.append('td').text(d => title(d.shape));
    rows.append('td').text(d => d.comments);
}

function onTextChanged(e) {
    const text = e.target.value;
    suggestedFilters = getSuggestedFilters(text);   
    updateFilters();
}

window.addEventListener('load', () => {
    let searchBar = document.querySelector('#search-bar');
    searchBar.addEventListener('input', onTextChanged);

    suggestedFilters = getSuggestedFilters();
    updateFilters();
    updateData();
});