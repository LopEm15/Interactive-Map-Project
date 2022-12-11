// create map
const myMap = {
    coordinates:[],
    businesses:[],
    map: {},
    markers: {},

    buildMap() {
        this.map= L.map('map', {
            center: this.coordinates,
            zoom: 11,
        });

    // Add OpenStreetMap tiles:
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            minZoom: '15',
        }).addTo(this.map)

     // create and add geolocation marker
        const marker= L.marker(this.coordinates)
        marker.addTo(this.map).bindPopup('<p1><b>You are here</b><br></p1>').openPopup()
    },

    // Business Marker Function
    addMarkers() {
        for (var i = 0; i < this.businesses.length; i++){
        this.markers = L.marker([
            this.businesses[i].lat,
            this.businesses[i].long,
        ])
            .bindPopup(`<p1>${this.businesses[i].name}</p1>`)
            .addTo(this.map)
       }
    },

}

// get coords via geolocation api
async function getCoords() {
    const pos = await new Promise((resolve,reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    });
    return [pos.coords.latitude, pos.coords.longitude]
}

// Setting up the Foursquare API (had to use solution code authorization as my foursquare application hasn't proccessed yet)
async function getFoursquare(business) {
    const option = {
        method: 'GET',
        headers: {
            Accept: 'aplication/json',
            Authorization: 'fsq3ATzZbmcGhdeFafr73wZcnJ+LlN6bK+4dh19a7ClS4u8='
        }
    }
    let limit = 5
    let lat = myMap.coordinates[0]
    let long = myMap.coordinates[1]
    let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${business}&limit=${limit}&ll=${lat}%2C${long}`, option)
    let data = await response.text()
    let parsedData = JSON.parse(data)
    let businesses = parsedData.results
    return businesses
}

// Foursquare processing array
function processBusinesses(data) {
    let businesses= data.map((element) => {
        let location = {
            name: element.name,
            lat: element.geocodes.main.latitude,
            long: element.geocodes.main.longitude
        };
        return location
    })
    return businesses
}

// Page load function to call map
window.onload = async () => {
    const coords= await getCoords()
    myMap.coordinates= coords
    myMap.buildMap()
}

// event handlers to call on business
document.getElementById('submit').addEventListener('click', async (event) => {
    event.preventDefault()
    let businesses = document.getElementById('business').value
    let data = await getFoursquare(businesses)
    myMap.businesses= processBusinesses(data)
    myMap.addMarkers()
})
// For some reason there are no hotels in my area when I know there is plenty