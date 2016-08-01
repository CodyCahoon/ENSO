var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
              ];


var margin = {top: 20, right: 200, bottom: 0, left: 20},
	width = 1000,
	height = 10000;

    var offsetY = 45;

var color = d3.scale.linear()
    .domain([-3, 0, 3])
    .range(["rgb(46, 103, 230)", "#AAB2BD", "#fe3c3c"]);

var x = d3.scale.linear()
	.range([0, width]);

var xAxis = d3.svg.axis()
	.scale(x)
    .tickFormat(function(d) { return monthNames[d - 1]})
	.orient("top");

//Create SVG element
var svg = d3.select("#graph")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.style("margin-left", margin.left + "px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//Load in JSON data
d3.json("data/data.json", function(data) {

    //Set the x-axis to be Jan-Dec
	x.domain([1, 12]);
	var xScale = d3.scale.linear()
		.domain([1, 12])
		.range([0, width]);

    //Create a group element for x-axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + 0 + ")")
		.call(xAxis);

    //Go through every data element
	for (var j = 0; j < data.length; j++) {
		var g = svg.append("g").attr("class", "year")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

        //Adds an invisible box to be able to show values
        //when not hovering over a circle
        g.append("rect")
            .attr("x", -30)
            .attr("y", j * offsetY)
            .attr("width", width + 60)
            .attr("height", 40)
            .attr("fill", "transparent");

		var circles = g.selectAll("circle")
			.data(data[j]['data'])
			.enter()
			.append("circle");

		var text = g.selectAll("text")
			.data(data[j]['data'])
			.enter()
			.append("text");

        // Our input data (domain) is -3 to 3, we want to scale this to
		// var rScale = d3.scale.linear()
		// 	.domain([-3, 3])
		// 	.range([-15, 15]);
        var scaleAmount = 7;

        //Position the circles on each row
        //cx - x-position
        //cy - y-position
        //r - radius
        //fill - fill color based on color function
		circles
			.attr("cx", function(d, i) { return xScale(d[0]); })
			.attr("cy", j*offsetY + 20)
			.attr("r", function(d) { return Math.abs(d[1] * scaleAmount); })
			.style("fill", function(d) { return color(d[1]); })

		text
			.attr("y", j*offsetY + 25)
			.attr("x",function(d, i) {
                return xScale(d[0])-10;
            })
			.attr("class","value")
			.text(function(d){ return d[1].toFixed(1); })
			.style("fill", function(d) { return color(d[1]); })
            .style("font-size", "14px")
			.style("display","none")
            .on("click", clickDataPoint);

		g.append("text")
			.attr("y", j*offsetY+25)
			.attr("x",width+20)
			.attr("class","label")
			.text(data[j]['year'])
			.style("fill", "#AAB2BD");


	};

	function mouseover() {
		var g = d3.select(this).node();
		d3.select(g).selectAll("circle").style("display","none");
		d3.select(g).selectAll("text.value").style("display","block");
	}

	function mouseout() {
		var g = d3.select(this).node();
		d3.select(g).selectAll("circle").style("display","block");
		d3.select(g).selectAll("text.value").style("display","none");
	}

    function clickDataPoint(data) {
        var month = monthNames[data[0] - 1];
        var value = data[1];
        var parentGroup = d3.select(this).node().parentNode;
        var year = d3.select(parentGroup).select("text.label")[0][0].innerHTML;
        console.log(month, value, year);
    }
});
