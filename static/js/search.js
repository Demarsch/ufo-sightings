let fiterSuggestions = [];

let activeFilters = [];

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

const dateSuggestions = [
    {
        search: 'this month',
        display: 'This month',
        filter: x => x.raw_datetime >= thisMonthStartDate
    },    
    {
        search: 'this year',
        display: 'This year',
        filter: x => x.raw_datetime >= thisYearStartDate
    },
    {
        search: 'last month',
        display: 'Last month',
        filter: x => x.raw_datetime >= lastMonthStartDate && x.raw_datetime < thisMonthStartDate
    },
    {
        search: 'last year',
        display: 'Last year',
        filter: x => x.raw_datetime >= lastYearStartDate && x.raw_datetime < thisYearStartDate
    }
]

function getDateSuggestions(text) {
    if (!text || text.length < 2) {
        return Array.from(dateSuggestions);
    }
    let date = Date.parse(text);
    if (date) {
        date += new Date().getTimezoneOffset() * 60000; //offset in milliseconds
        let dateStr = window.dateFormat(date, 'mmm d,yyyy')
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
    return dateSuggestions.filter(x => x.search.includes(text));
}

function getSuggestions(text) {
    text = text ? text.trim() : '';
    text = text.toLowerCase();
    let dateSuggestions = getDateSuggestions(text);
    return dateSuggestions;
}

function updateFilters() {
    
}

function onSelectFilter() {
    console.log('Select filter');
    updateFilters();
}

function onAddFilter() {
    console.log('Add filter');
    updateFilters();
}

function updateSuggestions(suggestions) {
    let selection = d3.select('.suggestion-list')
        .selectAll('.suggestion')
        .data(suggestions);

    selection.select('a.suggestion-text')
        .text(d => d.display);

    selection.exit().remove();

    var boxes = selection.enter()    
        .append('div')
        .attr('class', 'suggestion');
    boxes.append('a')
        .attr('class', 'suggestion-text')
        .attr('href', '#')
        .text(d => d.display)
        .on('click', onSelectFilter);
    boxes.append('a')
        .attr('class', 'suggestion-action')
        .attr('href', '#')
        .append('img')
        .attr('src', 'static/images/add.svg')
        .style('max-height', '100%')
        .on('click', onAddFilter);
}

function onSearch(e) {
    const text = e.target.value;
    let suggestions = getSuggestions(text);
    updateSuggestions(suggestions)
}

window.addEventListener('load', () => {
    let searchBar = document.querySelector('#search-bar');
    searchBar.addEventListener('input', onSearch);
    
    let suggestions = getSuggestions();
    updateSuggestions(suggestions)
});