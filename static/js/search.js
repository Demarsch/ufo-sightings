let activeFilters = []

let suggestedFilters = []

const countries = [
    'Austria',    
    'Canada',
    'Poland',
    'Russia',
    'US'
];

let rawCityData = {};
for (const item of data) {
    let country = rawCityData[item.country];
    if (!country) {
        country = {};
        rawCityData[item.country] = country;
    }
    let state = country[item.state];
    if (!state) {
        state = new Set();
        country[item.state] = state;
    }
    state.add(item.city);
}

let cityData = [];
for (const country in cityData) {
    const state = cityData[country];
    for (const city of state) {
        cityData.push({
            city: city,
            state: state,
            country: country
        })
    }
}

const now = new Date(Date.now());
     
const thisMonthStartDate = new Date(now.getYear(), now.getMonth(), 1);
const thisYearStartDate = new Date(now.getYear(), 0, 1);
const lastMonthStartDate = now.getMonth() == 0 ? new Date(now.getYear() - 1, 11, 1) : new Date(now.getYear(), now.getMonth() - 1, 1);
const lastYearStartDate = new Date(now.getYear() - 1, 0, 1);

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
        date += new Date().getTimezoneOffset() * 60000; //offset in milliseconds
        let dateStr = dateFormat(date, 'mmm d,yyyy')
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

function getSuggestedFilters(text) {
    text = text ? text.trim() : '';
    text = text.toLowerCase();
    let dateFilters = getDateFilters(text);
    return dateFilters;
}

function onRemoveFilter(filter) {

}

function onSelectFilter(filter) {
    activeFilters.forEach(f => f.active = false);
    filter.active = true;
    activeFilters = [ filter ];
    updateFilters();
}

function onAddFilter(filter) {
    filter.active = true;
    activeFilters.push(filter);
    updateFilters();
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
    //TODO: 
    return data;
}

function title(str) {
    let words = str.split(' ');
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function displayData(data) {
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
}

function onSearch(e) {
    const text = e.target.value;
    suggestedFilters = getSuggestedFilters(text);   
    updateFilters();
}

window.addEventListener('load', () => {
    let searchBar = document.querySelector('#search-bar');
    searchBar.addEventListener('input', onSearch);
    
    suggestedFilters = getSuggestedFilters();
    updateFilters();
    
    let data = getData();
    displayData(data);
});