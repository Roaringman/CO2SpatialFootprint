//global variables


//D3 Map
function initmap(element) {
    em = document.getElementById(element);
    empar = em.parentNode;
    console.log(empar.offsetWidth, empar.offsetHeight);
var width = empar.offsetWidth,
    height = empar.offsetHeight;

var projection = d3.geo.miller()
    .scale((width/640)*100-4)
    .translate([width / 2 , height / 2])
    .precision(0.2);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

var svg = d3.select("#"+element).append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

d3.json("data/world-countries.json", function(error, world) {
  if (error) throw error;

  svg.insert("path", ".graticule")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

  svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);
      console.log(svg);
});

};


//Helper functions

degToRad = function (num){
	return num * Math.PI / 180;
};

//This function calculates the great circle distance between two points,given as an array of arrays. Ex: [[lat1,lon1],[lat2,lon2]]
function haversine(points){
	var radpoints = [];
	for (var i=0;i<points.length;i++){
		radmap = points[i].map(degToRad);
		radpoints.push(radmap);
	};
	var distLon = radpoints[1][1] - radpoints[0][1];
	var distLat = radpoints[1][0] - radpoints[0][0];
	var a = Math.sin(distLat/2)**2 + Math.cos(radpoints[0][0]) * Math.cos(radpoints[1][0]) * Math.sin(distLon/2)**2;
	var c = 2 * Math.asin(Math.sqrt(a));
	var kilometers = (6367 * c); //Radius of earth
	return kilometers;
}

//Init

window.onload = init;

function init() {
    initmap("svgmap");
    
    
    
    
}
