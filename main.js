let regions = [];
let city_nodes = [];

const search_node = document.getElementById('search');
const suggestions_node = document.getElementById('suggestions-container');

// creates the main event listeners
search_node.addEventListener("keyup", startSearch);
search_node.addEventListener("focus", startSearch);
document.body.addEventListener("click", closeSuggestions);

// fetches all the regions from a json asynchronously
function getRegions () {
    return new Promise((resolve, reject) => {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState != 4) return;
            if (this.status === 200) {
                let data = JSON.parse(this.responseText);
                resolve(data);
            } else {
                reject()
            }
        };
        xhttp.open("GET", "http://localhost:3000/regions", true);
        xhttp.send();
        return xhttp;
    });
}

getRegions().then(response => {
    regions = response;
})

function updateSearchInput (event) {
    search_node.value = event.target.innerHTML;
    startSearch(event);
}

function openSuggestions (regions, search_key) {
    resetSuggestions();
    for (let region of regions) {
        let node = createSuggestionNodes(region, search_key);
        suggestions_node.appendChild(node);
    }
}

function closeSuggestions (event) {
    let tagName = event.target.tagName.toUpperCase();
    if (tagName !== 'INPUT' && tagName !== 'DIV') {
        resetSuggestions();
    }
}

function resetSuggestions () {
    suggestions_node.innerHTML = '';
    for (let node of city_nodes) {
        node.removeEventListener("click", updateSearchInput)
    }
}

function createSuggestionNodes (region, search_key) {
    let region_node = document.createElement('div');
    region_node.className = 'region';
    // add the region name
    let title_node = document.createElement('div');
    title_node.className = 'title';
    title_node.innerHTML = region.name;
    region_node.appendChild(title_node);
    // add the cities
    for (let city of region.cities) {
        let city_node = document.createElement('div');
        city_node.className = 'city';
        if (city.toLowerCase().includes(search_key)) {
            city_node.className = 'city selected';
        }
        city_node.innerHTML = city;
        city_node.addEventListener("click", updateSearchInput);
        city_nodes.push(city_node);
        region_node.appendChild(city_node);
    }
    return region_node;
}

function startSearch (event) {
    let value = event.target.value || event.target.innerHTML;
    let search_key = value.trim().toLowerCase();
    if (!search_key) {
        resetSuggestions();
        return;
    }
    // force text characters only
    let char = search_key[search_key.length - 1];
    if (!char.match(/[A-Za-z]/)) {
        search_key = search_key.slice(0, -1);
        search_node.value = search_key;
    }
    // filters all regions based on any match in the name or in any of the cities
    let searched_regions = regions.filter(region => {
        let name = region.name.toLowerCase()
        return name.includes(search_key) || region.cities.filter(city =>{
            return city.toLowerCase().includes(search_key);
        }).length;
    })
    // adds new elements to the DOM
    openSuggestions(searched_regions, search_key);
}
