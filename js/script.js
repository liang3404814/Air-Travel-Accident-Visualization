

// Global height and width
var width = 1500,
height = 1000;

var projection = d3.geo.miller()
.scale(150)
.translate([width / 2.0, height / 2])
.precision(0.1);

var path = d3.geo.path()
.projection(projection);

var svg = d3.select("body").append("svg")
.attr("width", width)
.attr("height", height);

var mapGroup = svg.append('g').attr("class", "mapGroup");


// Draws the world map, modified from https://gist.github.com/mbostock/4180634
d3.json("/js/world-50m.json", function(error, world) {
	mapGroup.insert("path")
	.datum(topojson.feature(world, world.objects.land))
	.attr("class", "land")
	.style("fill", "#808185")
	.attr("d", path);

	mapGroup.insert("path")
	.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
	.attr("class", "boundary")
	.attr("d", path);

	drawAccidents();
});




// parses a csv file containing all accidents, sorts the data and marks them on the map
function drawAccidents() {
	d3.text("/js/accidents-small.csv", function(rawData) {
		var parsedData = d3.csv.parse(rawData);
		parsedData.forEach(function(d, i) {
			parsedData[i].projectedCoords = projection([d.Longitude, d.Latitude])
		});
		console.log(parsedData);

		parsedData.sort(function(a, b) {
			return b['Total Death'] - a['Total Death']; // sort data by death toll
			//return a['Date'] - b['Date'];  // sort data chronologically

		});

		
		var circleGroup = svg
					.attr("class", "circles")
					.selectAll("g")
					.data(parsedData)
					.enter().append("g")
					.attr("class", "accidentMarker");

		var circle = circleGroup
					.append("circle")
					.attr('cx', function(d) { return d.projectedCoords[0]; })
					.attr('cy', function(d) { return d.projectedCoords[1]; })
					.attr('stroke-width', 1)
					.style('fill', '#f26422')
					.attr('r', 0)
					.transition()
					.duration(1000)
					.delay(function(d, i){ return (i * 20) })
					.attr('cx', function(d) { return d.projectedCoords[0]; })
					.attr('cy', function(d) { return d.projectedCoords[1]; })
					.attr('r', function(d) { return Math.sqrt(+d['Total Death']); }); // area encoding instead of radius encoding


	});
}


// TODO: add label to circle if death toll reaches a number
function addLabelwithCond(selection) {
	if (function(d) { return +d['Total Death'] > 250} ) {
		selection.text(function(d) { return +d['Total Death']; });
	}
}