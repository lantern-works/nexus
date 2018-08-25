console.log("Hello, World");

var map = L.map('map');
L.tileLayer('https://maps.tilehosting.com/c/ade1b05a-496f-40d1-ae23-5d5aeca37da2/styles/streets/{z}/{x}/{y}.png?key=ZokpyarACItmA6NqGNhr',   {
        attribution: false,
        maxZoom: 16,
        crossOrigin: true
    } ).addTo(map);

map.setView([38.42,-102.79], 4);