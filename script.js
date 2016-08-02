(function(){
    'use strict';

    //Set month names
    var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    // Create discretizied diverging color scale
    // Colors taken from Cynthia Brewer's "ColorBrewer." Diverging, 6-step blue-red.
    var colors = ['#2166ac', '#67a9cf', '#d1e5f0', '#fddbc7', '#ef8a62', '#b2182b'];
    // Range denotes discretized bins (min to -2.51 is first HEX, -2.5 to -2.01 is next, etc.)
    var oniRange = [-2, -1, 0, 1, 2, 3];
    var colorScale = d3.scale.threshold()
      .domain(oniRange)
      .range(colors);

    //Set data year range
    var yearRange = {
        start : 1950,
        end   : 2016
    };

    var $graph = $("#graph");
    var width = $graph.width();
    var height = $graph.height();

    //Scale factor for the circles
    var scaleAmount = 10;

    //Makes first and last data point not be cut off by edge
    var rangeOffset = 50;

    //Makes the 2016 dataset visible
    var domainOffset = 150;

    //Create SVG element
    var svg = d3.select("#graph")
    	.append("g")
    	.attr("transform", "translate(100, 25)");

    //Create scales to space everything correctly
    var xScale = d3.scale.linear()
        .domain([yearRange.start, yearRange.end])
        .range([0, width - domainOffset]);

    var yScale = d3.scale.linear()
        .domain([1, 12])
        .range([0 + rangeOffset, height - rangeOffset]);

    createAxis();

    //Load in JSON data
    d3.json("data/data.json", function(data) {

        var currentYear = yearRange.start;
        //Go through every data element
    	for (var j = 0; j < data.length; j++) {
            currentYear = yearRange.start + j;
    		var g = svg.append("g").attr("class", "year")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

            //Adds an invisible box to be able to show values
            //when not hovering over a circle
            g.append("rect")
                .attr("x", xScale(currentYear) - 30)
    			.attr("y", 0)
                .attr("width", 60)
                .attr("height", height)
                .attr("fill", "transparent");

    		var circles = g.selectAll("circle")
    			.data(data[j]['data'])
    			.enter()
    			.append("circle");

    		var text = g.selectAll("text")
    			.data(data[j]['data'])
    			.enter()
    			.append("text");

    		circles
    			.attr("cx", xScale(currentYear))
    			.attr("cy", function(d) { return yScale(d[0])})
    			.attr("r",  function(d) { return Math.abs(d[1] * scaleAmount); })
    			.style("fill", function(d) { return colorScale(d[1]); });

    		text
    			.attr("x", xScale(currentYear) - 17.5)
    			.attr("y", function(d) { return yScale(d[0]) + 5})
    			.attr("class", "value")
                .attr("data-year", currentYear)
    			.text(function(d){
                    var value = d[1].toFixed(2);
                    return value >= 0 ? '+' + value : value;
                })
    			.style("fill", function(d) { return colorScale(d[1]); })
                .on("click", clickDataPoint);
    	};


    	/**
    	 * Called when entering invisible box for each year,
         * displays the associated values for that year
    	 */
    	function mouseover() {
    		var g = d3.select(this).node();
    		d3.select(g).selectAll("circle").style("display","none");
    		d3.select(g).selectAll("text.value").style("display","block");
    	}


    	/**
    	 * Called when leaving the invisible box for each year
    	 */
    	function mouseout() {
    		var g = d3.select(this).node();
    		d3.select(g).selectAll("circle").style("display","block");
    		d3.select(g).selectAll("text.value").style("display","none");
    	}

        /**
         * Called whenever the user clicks a text element
         *
         * @param  {array}   data  Data element clicked - [month, value]
         * @param  {integer} index Index of element clicked
         */
        function clickDataPoint(data, index) {
            var month = monthNames[index];
            var year = $(this).attr("data-year");
            console.log(month, year);
        }
    });

    /**
     * Creates x-axis and y-axis
     */
    function createAxis() {
        createXAxis();
        createYAxis();
    }

    /**
     * Creates x-axis
     */
    function createXAxis() {
        var xAxis = d3.svg.axis()
        	.scale(xScale)
        	.orient("top")
            .ticks(yearRange.end - yearRange.start)
            .tickFormat(function(d) {
                return d.toString();
            });

    	svg.append("g")
    		.attr("class", "x axis")
    		.attr("transform", "translate(0, 0)")
    		.call(xAxis);
    }

    /**
     * Creates y-axis
     */
    function createYAxis() {
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .tickFormat(function (d) {
                return monthNames[d - 1];
            });

    	svg.append("g")
    		.attr("class", "y axis")
    		.attr("transform", "translate(-50, 0)")
            .style("position", "fixed")
    		.call(yAxis);
    }
})();
