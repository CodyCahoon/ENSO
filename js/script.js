(function(){
    'use strict';

    //Current displayed value in chart
    var currentENSO = {
        data: null,
        max: 0,
        scaledMax : 0
    };

    var nino34 = {
        data: null,
        max : 0
    };

    //Inner padding for graph, prevents data points from being cut off
    var padding = 50;

    //Space between adjacent columns (years)
    var spaceBetween = 10;

    var svg = d3.select('#graph');
    var yAxis = d3.select('#y-axis');
    var $graph = $('#graph');
    var width,
        height,
        xScale,
        yScale,
        rScale;

    $(document).ready(function(){
        var $body = $('body');

        $(window).resize(redrawSVG);

        //Event Handlers for the bounding boxes for each circle + text
        $body.on('click', '.bounding-box', clickDataPoint);
        $body.on('mouseenter', '.bounding-box', showCurrentMonthValues);
        $body.on('mouseleave', '.bounding-box', hideCurrentMonthValues);

        //Event handlers for entire graph
        $body.on('mouseenter', '#graph', toggleCircleVisibility);
        $body.on('mouseleave', '#graph', toggleCircleVisibility);

        //Event handlers for each year
        $body.on('mouseenter', '.year', showCurrentYearValues);
        $body.on('mousemove', '.year', showCurrentYearValues);
        $body.on('mouseleave', '.year', hideCurrentYearValues);

        init();
    });

    /**
     * Loads all data required (currently only Niño 3.4) and sets default
     * display data (currently defaults to display Niño 3.4)
     */
    function init() {
        loadNino34();
    }

    /**
     *  Load data for Niño 3.4
     *  170W - 120W, 5N - 5S,
     *  Jan 1950 - Jun 2016
     */
    function loadNino34() {
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
    }

    /**
     * Loops through currentENSO variable to display all data associated,
     * creates a circle, where radius is based on ONI value [-3, 3],
     * hovering over a circle displays the corresponding ONI value
     *
     * @param  {array} data The currentENSO data to show in the format of
     *                      [
     *                          {
     *                              'year': 1950,
     *                              'data': [
     *                                  [1, -1.41],
     *                                  ...
     *                                  [12, -0.89]
     *                              ]
     *                          },
     *                          ...
     *                          {
     *                              'year': 2016,
     *                              'data': [
     *                                  [1, 2.23],
     *                                  ...
     *                                  [12, 0.00]
     *                              ]
     *                          }
     */
    function displayData(data) {
        var currentYear = 0;
        var groupWidth = 2 * (currentENSO.scaledMax + spaceBetween/2);

    	for (var j = 0; j < data.length; j++) {
            currentYear = data[j]['year'];

    		var g = svg.append('g')
                .attr('class', 'year');

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
                    return d[1] >= 0 ? x - 22 : x - 19;
                })
    			.attr('y', function(d) { return yScale(d[0]) + 5})
    			.text(function(d){
                    var value = d[1].toFixed(2);
                    return value >= 0 ? '+' + value : value;
                })
                .attr('class', function(d) { return 'value ' + colorScale(d[1])});

            bounds
    			.attr('x', xScale(currentYear) - currentENSO.scaledMax - spaceBetween)
    			.attr('y',        function(d) { return yScale(d[0]) - currentENSO.scaledMax})
    			.attr('width',     function() { return currentENSO.scaledMax * 2 + spaceBetween; })
                .attr('height',    function() { return currentENSO.scaledMax * 2; })
                .attr('fill',      'transparent')
                .attr('data-year', currentYear)
                .attr('data-month', function(d){ return d[0]})
                .attr('class',     'bounding-box');
    	}
    }

    /**
     * Called whenever the user clicks the currently hovered value
     */
    function clickDataPoint() {
        var index = d3.select(this).attr('data-month') - 1;
        var month = monthNames[index];
        var year = d3.select(this).attr('data-year');
        console.log(month, year);
    }

    /**
     * Called when entering invisible box for each year,
     * displays the associated values for that year
     */
    function showCurrentYearValues() {
        var g = d3.select(this).node();
        d3.select(g).selectAll('circle').style('opacity', '0');
        d3.select(g).selectAll('text.value').style('opacity', '1');
    }

    /**
     * Called when leaving the invisible box for each year
     */
    function hideCurrentYearValues() {
        var g = d3.select(this).node();
        d3.select(g).selectAll('circle').style('opacity', '1');
        d3.select(g).selectAll('text.value').style('opacity','0');
    }

    /**
     * Shows all of the points in a given row (month)
     */
    function showCurrentMonthValues() {
        var month = d3.select(this).attr('data-month');
        console.log(month);

        //Hide all circles for same month
        d3.selectAll('circle').each(function(data){
            if (data[0] == month) {
                d3.select(this).style('opacity', '0');
            }
        });

        //Show all values for same month
        d3.selectAll('text.value').each(function(data){
            if (data[0] == month) {
                d3.select(this).style('opacity', '1');
            }
        });
    }

    /**
     * Hides all of the points in a given row/month
     */
    function hideCurrentMonthValues() {
        var month = d3.select(this).attr('data-month');

        //Shows all circles for same month
        d3.selectAll('circle').each(function(data){
            if (data[0] == month) {
                d3.select(this).style('opacity', '1');
             }
        });

        //Hides all values for same month
        d3.selectAll('text.value').each(function(data){
            if (data[0] == month) {
                d3.select(this).style('opacity', '0');
            }
        });
    }


    /**
     * Fades in/out all circles on the graph
     */
    function toggleCircleVisibility() {
        $('circle').toggleClass('fade');
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
