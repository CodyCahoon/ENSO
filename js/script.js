(function(){
    'use strict';

    var currentENSO = {
        data: null,
        max: 0,
        scaledMax : 0
    };

    //Data points
    var nino34 = {
        data: null,
        max : 0
    };

    //Makes first and last data point not be cut off by edge
    var padding = 50;

    //Space between adjacent columns
    var spaceBetween = 10;

    //Create SVG element
    var svg = d3.select('#graph');
    var yAxis = d3.select('#y-axis');

    var $graph = $('#graph');
    var width,
        height,
        xScale,
        yScale,
        rScale;

    $(window).resize(redrawSVG);

    //Load in JSON data
    d3.json('data/nino34.json', function(years) {
        nino34.data = years;
        nino34.max = d3.max(years, function(year){
            return d3.max(year.data, function (month) {
                return Math.abs(month[1]);
            });
        });
        jQuery.extend(true, currentENSO, nino34);
        redrawSVG();
    });

    function displayData(data) {
        var currentYear = 0;
        var groupWidth = 2 * (currentENSO.scaledMax + spaceBetween/2);

    	for (var j = 0; j < data.length; j++) {
            currentYear = data[j]['year'];
    		var g = svg.append('g').attr('class', 'year')
            .on('mouseover', mouseover)
            .on('mouseout', mouseout);

    		var circles = g.selectAll('circle')
    			.data(data[j]['data'])
    			.enter()
    			.append('circle');

    		var text = g.selectAll('text')
    			.data(data[j]['data'])
    			.enter()
    			.append('text');

            var bounds = g.selectAll('rect')
                .data(data[j]['data'])
    			.enter()
    			.append('rect');

            circles
    			.attr('cx', xScale(currentYear))
    			.attr('cy',    function(d) { return yScale(d[0])})
    			.attr('r',     function(d) { return rScale(Math.abs(d[1])); })
                .attr('class', function(d) { return colorScale(d[1])})

    		text
    			.attr('x', function(d) {
                    var x = xScale(currentYear);
                    return d[1] >= 0 ? x - 23 : x - 20;
                })
    			.attr('y', function(d) { return yScale(d[0]) + 5})
    			.text(function(d){
                    var value = d[1].toFixed(2);
                    return value >= 0 ? '+' + value : value;
                })
                .attr('class', function (d) {
                    if (d[1] < 0) {
                        return 'value level-1';
                    } else {
                        return 'value level-4';
                    }
                });

            bounds
    			.attr('x', xScale(currentYear) - currentENSO.scaledMax - spaceBetween)
    			.attr('y',        function(d) { return yScale(d[0]) - currentENSO.scaledMax})
    			.attr('width',     function() { return currentENSO.scaledMax * 2 + spaceBetween; })
                .attr('height',    function() { return currentENSO.scaledMax * 2; })
                .attr('fill',      'transparent')
                .attr('data-year', currentYear)
                .on('click',       clickDataPoint)
                .on('mouseenter',  showCurrentMonth)
                .on('mouseleave',  hideCurrentMonth);
    	};

    	/**
    	 * Called when entering invisible box for each year,
         * displays the associated values for that year
    	 */
    	function mouseover() {
    		var g = d3.select(this).node();
    		d3.select(g).selectAll('circle').style('opacity', '0');
    		d3.select(g).selectAll('text.value').style('opacity', '1');
    	}

    	/**
    	 * Called when leaving the invisible box for each year
    	 */
    	function mouseout() {
    		var g = d3.select(this).node();
    		d3.select(g).selectAll('circle').style('opacity', '1');
    		d3.select(g).selectAll('text.value').style('opacity','0');
    	}

        /**
         * Called whenever the user clicks a text element
         *
         * @param  {array}   data  Data element clicked - [month, value]
         * @param  {integer} index Index of element clicked
         */
        function clickDataPoint(data, index) {
            var month = monthNames[index];
            var year = $(this).attr('data-year');
            console.log(month, year);
        }

        /**
         * Shows all of the points in a given row/month
         *
         * @param  {array} d     data being passed in
         * @param  {integer} index index of element
         */
        function showCurrentMonth(d, index) {
            var month = index + 1;

            //Hide all circles for same month
            d3.selectAll('circle').each(function(data){
                if (data[0] === month) {
                    d3.select(this).style('opacity', '0');
                }
            });

            //Show all text for same month
            d3.selectAll('text.value').each(function(data){
                if (data[0] === month) {
                    d3.select(this).style('opacity', '1');
                }
            });
        }


        /**
         * Hides all of the points in a given row/month
         *
         * @param  {array} d     data being passed in
         * @param  {integer} index index of element
         */
        function hideCurrentMonth(d, index) {
            var month = index + 1;

            //Shows all circles for same month
            d3.selectAll('circle').each(function(data){
                if (data[0] === month) {
                    d3.select(this).style('opacity', '1');
                }
            });

            //Hides all text for same month
            d3.selectAll('text.value').each(function(data){
                if (data[0] === month) {
                    d3.select(this).style('opacity', '0');
                }
            });
        }
    }

    /**
     * Clears out old drawing, update scales, and redraws
     * axis and data points for current selection (nino34 only so far)
     */
    function redrawSVG() {
        clearSVG();
        updateScales();
        createAxes();
        displayData(currentENSO.data);
    }


    /**
     * Removes graph and y-axis before redrawing
     */
    function clearSVG() {
        svg.selectAll('*').remove();
        yAxis.selectAll('*').remove();
    }

    /**
     * Updates the width & height of container to reposition
     * axis and data points
     */
    function updateScales() {
        height = $graph.height();

        rScale = d3.scaleLinear()
            .domain([0, currentENSO.max])
            .range([0.5, (height - (2*padding)) / 22]);

        currentENSO.scaledMax = rScale(currentENSO.max);

        width = (currentENSO.data.length * currentENSO.scaledMax * 2) + spaceBetween;
        $graph.width(width);

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
    function createAxes() {
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

    	svg.append('g')
    		.attr('class', 'x axis')
            .attr('transform', 'translate(0, 25)')
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

    	yAxis.append('g')
    		.attr('class', 'y axis')
    		.attr('transform', 'translate(50, 0)')
    		.call(y);
    }
})();
