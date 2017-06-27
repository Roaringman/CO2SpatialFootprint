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

var persemission = 0;


//D3 Map
function initmap(element, projec) {
    
    //empty element and set ids for the element and its parent
    console.log("Initmap");
    document.getElementById(element).innerHTML = "";
    em = document.getElementById(element);
    empar = em.parentNode;

//Getting width and height of the parent element to adjust map size
var width = empar.offsetWidth+50,
    height = empar.offsetHeight-50;
    console.log(height, (height) / 2+140);

//Set projection
var projection = projec    
    .scale(((width/640)*80))
    .translate([width / 2 , (height) / 2+(height/100)])
    .precision(0.2);

var path = d3.geo.path(projection)
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
    


//Look up if origin or destination are set and sets a marker 
if (destination.id || origin.id) {   

    if (origin.id) {var marks = [{long: origin.lon, lat: origin.lat}]; 
        if (destination.id) {
            //If both are set, this code gets executed
            var marks = [{long: origin.lon, lat: origin.lat}, 
            {long: destination.lon, lat: destination.lat}];
                
                 //If both origin and destination are chosen, the line between them is drawn.
                    var gpath = [{lat: origin.lat,long: origin.lon},{lat: destination.lat,long: destination.lon}];
                    var orp = projection([gpath[0].long,gpath[0].lat]);
                    var dep = projection([gpath[1].long,gpath[1].lat]);
                    var line = d3.select("#"+element).append("svg");
                     
                        svg.append("line")
                        .attr("x1", orp[0])
                        .attr("y1", orp[1])
                        .attr("x2", dep[0])
                        .attr("y2", dep[1])
                        .attr("stroke-width", 2)
                        .attr("stroke", "red");
    
                        
                        
                           
            //calculation of the distance between the two points
           var res =  haversine([[origin.lat, origin.lon],[destination.lat, destination.lon]]);
            console.log("Res: " + res);
            
            }
			
        
    ;} else if (destination.id) {var marks = [{long: destination.lon, lat: destination.lat}];}
    
    //actual marker will be set, according to what has been saved in the marks list. Original Marker: 'https://cdn3.iconfinder.com/data/icons/softwaredemo/PNG/24x24/DrawingPin1_Blue.png'
    svg.selectAll(".mark")
        .data(marks)
        .enter()
        .append("image")
        .attr('class','mark')
        .attr('width', 20)
        .attr('height', 20)
        .attr('y', -17)
        .attr('x', -10)
        .attr("xlink:href","img/Airport-pin.svg")
        .attr("transform", function(d) {return "translate(" + projection([d.long,d.lat]) + ")";});     
};

    //positioning of the circle that is to be created. position in brazilian rainforest
    var y = -10 
    var x = -45


    //circle creation once destination and origin are set up and the distance is calculated
    if (destination.id && origin.id) {
        var circs = [100];
        var radius = Math.sqrt(((res*30)/2000)/(Math.PI)); //formula for calculating the radius. 30kg emission per km of a plane. 2000kg/km² biomass carbon
        var area = (radius*radius)*Math.PI;

        //output log
        //console.log("Circle calculation: Radius = SQRT((Distance*kg Co2 per km)/kg C per km²)/PI)");
        //console.log("Radius = SQRT((" + res + " * 30)/ 2000)/PI)" );
        //console.log("Radius = " + radius);
        //console.log("Area = " + area + " km²");

        //calculation of emission per capita. needed for statistical map
		persemission = ((res*30)/215)/1000;
        
        console.log("Emission per person = " + persemission + " t");

        //circle drawing
        svg.selectAll(".circle")
            .data(circs)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('r', radius)
            .attr('cy', y)
            .attr('cx', x)
            .attr("transform", function(d) {return "translate(" + projection([x,y]) + ")";})
            ;


    }

    //else if (element == "svgmap") {initmap("secondmap", d3.geo.miller());};


    //Selecting of the world map json and its drawing on the svg element
    //World map json does not contain any info about the countries!
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

    //returning to global variable
    
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

//Init ---------------------------------------------------------------------------------------------

window.onload = init;

function init() {
	
	d3.json('data/world.geojson', function(error, world) {
	//Initial map
	drawMap(world.features, colorPaintAll);
	
	d3.select("#emissionButton").on("click", function() {
		console.log("clicked!");
        drawMap(world.features, colorPaintAll);
    });

	d3.select("#compareButton").on("click", function(d) {
			drawMap(world.features, colorPaintCompare);
		});
	
	
	});
	

    
    //Starts the map with a set parent element and a set projection
    initmap("svgmap", d3.geoEckert5());
 
}


function showResult(str, box, key, e) {
    e.preventDefault();
    
    //Function gets called, when something is typed in either of the input boxes
    
    //Sets ids for the result boxes and the origin input
    var rena = ["resultor", "resultde"];
    if (box.id=="origintb") {var resuif = rena[0];}
    else {var resuif = rena[1];};
    var resultbox = document.getElementById(resuif);

    //Detecting of certain key stokes (Enter = 13, Esc=27), but thats not working somehow
    if (key==13 && resultbox.innerHTML !== "") {alert("Choose an airport from the list. If your airport is not listed, check your input for spelling errors or try another name.");}
    else if (key==27) {     
        document.getElementById(rena[0]).innerHTML = "";
        document.getElementById(rena[1]).innerHTML = "";
        return;}
    
    
    //Emptying of the result elements
    document.getElementById(rena[0]).innerHTML = "";
    document.getElementById(rena[0]).style.display = 'none';   
    document.getElementById(rena[1]).innerHTML = "";
    document.getElementById(rena[1]).style.display = 'none';   
    
    //Selecting the data from the airports json 
    d3.json("data/airports.json", function(error, data) {
    if (error) throw error;
    //Search does not start for less than three characters
    if (str.length<3) {return; };
    
    //Search is handled in lower case (so typos wont matter)
    str = str.toLowerCase();
    //Compares all elements (name, city, county, and the abbreviations) of the json with the typed string (str)
    for(var i=0,j=data.length; i<j; i++){
        dataid=data[i].id;
        datain=data[i].name;
        dataic=data[i].city || "";
        datail=data[i].country || "";
        dataia=data[i].ak || "---";
        dataib=data[i].lak || "----";

      //If indexOf(str) is larger than -1 the result includes the string str
      if (datain.toLowerCase().indexOf(str) !==-1 ||
            dataic.toLowerCase().indexOf(str) !==-1 ||
            datail.toLowerCase().indexOf(str) !==-1 ||
            dataia.toLowerCase().indexOf(str) !==-1 ||
            dataib.toLowerCase().indexOf(str) !==-1) 
      {
          //append the found results to the resultbox
            resultbox.innerHTML += "<a id='" + i + "'onClick='insertresult(this)'>" + datain + " (" + dataia + ") / " + dataic + " / " + datail + "<a></br>";
            
            //To insert the result directly press Enter (13) or Tab (9) - not working! 
                   if (key == 13 || key == 9) {
                  document.getElementById(box).value = datain + " (" + dataia + ") / " + dataic + " / " + datail;
                  return;
              }
              
        resultbox.style.display = "block";     
              
          };
    };
    
    });
};

//This function should prevent default key functions in the textbox but doesnt
function handle(e) {e.preventDefault();};


//The function to insert a chosen result into the textbox and saves the objects origin and destination which contain all infos about those
function insertresult(a) {

    //Selecting the airport json
    d3.json("data/airports.json", function(error, data) {
         if (error) throw error;
        var dataid=data[a.id].id;
        var datain=data[a.id].name;
        var dataic=data[a.id].city || "";
        var datail=data[a.id].country || "";
        var dataia=data[a.id].ak || "---";
        var dataib=data[a.id].lak || "----";
        
        //Depeding on which reultbox has been clicked on the destination or origin will be set.
            if(a.parentNode.id == "resultor") {document.getElementById("origintb").value = datain + " (" + dataia + ") / " + dataic + " / " + datail;
            origin = {
                id: dataid,
                name: datain,
                lat: data[a.id].lat,
                lon: data[a.id].long
                
            };

          document.getElementById(a.parentNode.id).style.display = "none";
          document.getElementById(a.parentNode.id).innerHTML = ""; 
            
            initmap("svgmap", d3.geoEckert5());
            
           } else {document.getElementById("desttb").value = datain + " (" + dataia + ") / " + dataic + " / " + datail;
                destination = {
                    id: dataid,
                    name: datain,
                    lat: data[a.id].lat,
                    lon: data[a.id].long
                
                };
            
            initmap("svgmap", d3.geoEckert5());
                
            };
      
          
          document.getElementById(a.parentNode.id).style.display = "none";
          document.getElementById(a.parentNode.id).innerHTML = "";
    });

};

var statWidth = 350;
var statHeight = 225;

var projection =  d3.geoEckert5()
	.center([0, 0])
	.scale(125)
	.translate([statWidth, statHeight]);

function drawMap(data, colorPicker) {
    var pathGenerator = d3.geoPath()
        .projection(projection);
		
	var statGraticule = d3.geo.graticule()
      .step([10, 10]);
    
    var selection = d3.select('.statmap .mapRoot')
        .selectAll("path")
        .data(data)	
    ;

	selection.attr("d", pathGenerator)
	.style("fill", colorPicker);
    
    // what to do with NEW elements
    selection.enter()
	.append("path")
    .attr("d", pathGenerator)
	.style("fill", colorPicker)
	.on("mouseover", highlight)
	.on("mouseout", dehighlight)
	;
}

var thresholdColors = d3.scale.quantize()
 .domain([0,40])
 .range(['#ffffcc','#c2e699','#78c679','#31a354','#006837']);
 
 var colorPaintAll = function (d) {
 var color = d.properties.Emission;
 if (color){
 return thresholdColors(parseInt(color));}
 else{return "lightgray"}
};

var colorPaintCompare = function (d) {
 var colorm = d.properties.income_med_m;
 var emit = d.properties.Emission;
 
 if (persemission == 0){return 'lightgray'}
 else if (emit < persemission)  {return '#efedf5' }
 else {return '#756bb1'};
};


function highlight(d){

	//Adding dark "highlights" when hovering
	active = d3.select(this).classed("active", true);
	var color = d3.rgb(d3.select(this).style("fill")); 
	active.style("fill", color.darker());
	
	var labelTitle = "Emission per capita";
	var labelEmission = Number(eval("d.properties.Emission")).toFixed(2);
	//adding a label
	var infolabel = d3.select(".box4").append("div")
		.attr("class", "infolabel")
		.attr("id", "label") 
		.html("<h1>"+labelTitle+"</h1>")
		.append("div") 
		.attr("class", "labelvalue") 
		.html("<h2> "+ d.properties.SOV_A3 +"<br>" + labelEmission + "  tons CO2</h2>");
}

function dehighlight(){
    active = d3.select(this).classed("active", true);
	var color = d3.rgb(d3.select(this).style("fill")); 
	active.style("fill", color.brighter());
	d3.select("#label").remove();
}

onload= legendDemo();
  function legendDemo() {

  sampleNumerical = [1,2.5,5,10,20];
  sampleThreshold=d3.scale.threshold().domain(sampleNumerical).range(['#ffffcc','#c2e699','#78c679','#31a354','#006837']);
  horizontalLegend = d3.svg.legend().units("Miles").cellWidth(80).cellHeight(25).inputScale(sampleThreshold).cellStepping(100);

  d3.select("svg").append("g").attr("transform", "translate(50,70)").attr("class", "legend").call(horizontalLegend);

  sampleCategoricalData = ["Something","Something Else", "Another", "This", "That", "Etc"]
  sampleOrdinal = d3.scale.category20().domain(sampleCategoricalData);

  verticalLegend = d3.svg.legend().labelFormat("none").cellPadding(5).orientation("vertical").units("Things in a List").cellWidth(25).cellHeight(18).inputScale(sampleOrdinal).cellStepping(10);

  d3.select("svg").append("g").attr("transform", "translate(50,140)").attr("class", "legend").call(verticalLegend);

  }