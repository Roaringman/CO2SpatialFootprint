//Helper functions

degToRad = function (num){
	return num * Math.PI / 180;
}

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
