//global variables
var origin = {
    id: "",
    name: "",
    lat: "",
    lon: ""
};
var destination = {
    id: "",
    name: "",
    lat: "",
    lon: ""
};

//D3 Map
function initmap(element) {
    document.getElementById(element).innerHTML = "";
    em = document.getElementById(element);
    empar = em.parentNode;

var width = empar.offsetWidth,
    height = empar.offsetHeight-4;

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
    



if (destination.id || origin.id) {   
    console.log(origin, destination);
    if (origin.id) {var marks = [{long: origin.lon, lat: origin.lat}]; 
        if (destination.id) {
            var marks = [{long: origin.lon, lat: origin.lat}, 
            {long: destination.lon, lat: destination.lat}];

                
                 //This is the accessor function we talked about above
                 var lineFunction = d3.svg.line()
                         .x(function(d) { return d.long; })
                         .y(function(d) { return d.lat; })
                         .interpolate("linear")
                          ;
                                                 
                        
                        var lineGraph = svg.append("path")
                           .attr("d", lineFunction(marks))
                           .attr("stroke", "red")
                           .attr("stroke-width", 2)
                           .attr("fill", "none")
                           ;
                           
                        console.log(lineGraph);
            
            
            
            }
        
    ;} else if (destination.id) {var marks = [{long: destination.lon, lat: destination.lat}];} 
    
    
    svg.selectAll(".mark")
        .data(marks)
        .enter()
        .append("image")
        .attr('class','mark')
        .attr('width', 20)
        .attr('height', 20)
        .attr("xlink:href",'https://cdn3.iconfinder.com/data/icons/softwaredemo/PNG/24x24/DrawingPin1_Blue.png')
        .attr("transform", function(d) {return "translate(" + projection([d.long,d.lat]) + ")";});     
};

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


function showResult(str, box, key, e) {
    e.preventDefault();
    
    
    
    var rena = ["resultor", "resultde"];
    if (box.id=="origintb") {var resuif = rena[0];}
    else {var resuif = rena[1];};
    var resultbox = document.getElementById(resuif);

    if (key==13 && resultbox.innerHTML !== "") {alert("Choose an airport from the list. If your airport is not listed, check your input for spelling errors or try another name.");}
    else if (key==27) {     
        document.getElementById(rena[0]).innerHTML = "";
        document.getElementById(rena[1]).innerHTML = "";
        return;}
    
     
    document.getElementById(rena[0]).innerHTML = "";
    document.getElementById(rena[1]).innerHTML = "";   
    
        
    d3.json("data/airports.json", function(error, data) {
    if (error) throw error;
    if (str.length<3) {return; };
    for(var i=0,j=data.length; i<j; i++){
        dataid=data[i].id;
        datain=data[i].name;
        dataic=data[i].city || "";
        datail=data[i].country || "";
        dataia=data[i].ak || "---";
        dataib=data[i].lak || "----";

       
      if (datain.indexOf(str) !==-1 ||
            dataic.indexOf(str) !==-1 ||
            datail.indexOf(str) !==-1 ||
            dataia.indexOf(str) !==-1 ||
            dataib.indexOf(str) !==-1) 
      {
            resultbox.innerHTML += "<a id='" + i + "'onClick='insertresult(this)'>" + datain + " (" + dataia + ") / " + dataic + " / " + datail + "<a></br>"; 
                   if (key == 13 || key == 9) {
                  document.getElementById(box).value = datain + " (" + dataia + ") / " + dataic + " / " + datail;
                  return;
              }
             
              
          };
    };
    
    });
};

function handle(e) {e.preventDefault();};

function insertresult(a) {

    
    d3.json("data/airports.json", function(error, data) {
         if (error) throw error;
        var dataid=data[a.id].id;
        var datain=data[a.id].name;
        var dataic=data[a.id].city || "";
        var datail=data[a.id].country || "";
        var dataia=data[a.id].ak || "---";
        var dataib=data[a.id].lak || "----";
        
            if(a.parentNode.id == "resultor") {document.getElementById("origintb").value = datain + " (" + dataia + ") / " + dataic + " / " + datail;
            origin = {
                id: dataid,
                name: datain,
                lat: data[a.id].lat,
                lon: data[a.id].long
                
            };

          document.getElementById(a.parentNode.id).innerHTML = "";
            
            
            initmap("svgmap");
           
           
           
           
           } else {document.getElementById("desttb").value = datain + " (" + dataia + ") / " + dataic + " / " + datail;
                destination = {
                    id: dataid,
                    name: datain,
                    lat: data[a.id].lat,
                    lon: data[a.id].long
                
                };
            
            initmap("svgmap");
                
            };
      
          document.getElementById(a.parentNode.id).innerHTML = "";


    });

};
