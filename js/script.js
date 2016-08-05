(function(){
    'use strict';

    //Data points
    var nino34 = {
        max : 0,
        data: null
    };

    //Makes first and last data point not be cut off by edge
    var padding = 50;

    //Space between adjacent columns
    var spaceBetween = 10;

    //Create SVG element
    var svg = d3.select("#graph");
    var yAxis = d3.select("#y-axis");

    var $graph = $("#graph");
    var width = 0,
        height = 0,
        xScale,
        yScale,
        rScale;

    $(window).resize(redrawSVG);

    //Load in JSON data
    d3.json("data/nino34.json", function(data) {
        nino34.data = data;
        nino34.max = d3.max(data, function(d){
            return d3.max(d.data, function (val) {
                return Math.abs(val[1]);
            });
        });
        redrawSVG();
    });

    function displayData(data) {
        var currentYear = yearRange.start;
        var groupWidth = 2 * (rScale(nino34.max) + spaceBetween/2);
        //Go through every data element
    	for (var j = 0; j < data.length; j++) {
            currentYear = yearRange.start + j;
    		var g = svg.append("g").attr("class", "year")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

            //Invisible box to enable hovering in any place in group
            g.append("rect")
                .attr("x", xScale(currentYear) - groupWidth/2)
    			.attr("y", 0)
                .attr("width", groupWidth)
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
    			.attr("r",  function(d) { return rScale(Math.abs(d[1])); })
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
    }

    /**
     * Clears out old drawing, update scales, and redraws
     * axis and data points for current selection (nino34 only so far)
     */
    function redrawSVG() {
        clearSVG();
        updateScales();
        createAxis();
        displayData(nino34.data);
    }


    /**
     * Removes graph and y-axis before redrawing
     */
    function clearSVG() {
        svg.selectAll("*").remove();
        yAxis.selectAll("*").remove();
    }

    /**
     * Updates the width & height of container to reposition
     * axis and data points
     */
    function updateScales() {
        height = $graph.height();

        rScale = d3.scaleLinear()
            .domain([0, nino34.max])
            .range([0, (height - (2*padding)) / 24]);

        width = nino34.data.length * (rScale(nino34.max) * 2 + spaceBetween);
        $graph.width(width);

        //Create scales to space everything correctly
        xScale = d3.scaleLinear()
            .domain([yearRange.start, yearRange.end])
            .range([padding, width - padding]);

        yScale = d3.scaleLinear()
            .domain([1, 12])
            .range([padding, height - padding]);
    }

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
        var x = d3.axisTop(xScale)
            .ticks(yearRange.end - yearRange.start)
            .tickFormat(function(d) {
                return d.toString();
            });

    	svg.append("g")
    		.attr("class", "x axis")
            .attr("transform", "translate(0, 25)")
    		.call(x);
    }

    /**
     * Creates y-axis
     */
    function createYAxis() {
        var y = d3.axisLeft(yScale)
            .tickFormat(function (d) {
                return monthNames[d - 1];
            });

    	yAxis.append("g")
    		.attr("class", "y axis")
    		.attr("transform", "translate(50, 0)")
    		.call(y);
    }
})();
