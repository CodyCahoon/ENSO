(function(){
    'use strict';

    /*******************************************************************
     *                            VARIABLES                            *
     *******************************************************************/

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

    var selectedYears = [];

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

    var $filter = d3.select('.filter');

    /*******************************************************************
     *                       SET EVENT HANDLERS                        *
     *******************************************************************/

    $(document).ready(function(){
        var $body = $('body');

        $(window).resize(redrawSVG);

        //Event Handlers for the bounding boxes for each circle + text
        $body.on('click',      '.bounding-box', clickMonthAndYear);
        $body.on('mouseenter', '.bounding-box', showCurrentMonthValues);
        $body.on('mouseleave', '.bounding-box', hideCurrentMonthValues);

        //Event handlers for entire graph
        $body.on('mouseenter', '#graph', toggleCircleVisibility);
        $body.on('mouseleave', '#graph', toggleCircleVisibility);

        //Event handlers for each year
        $body.on('mouseenter', '.year', showCurrentYearValues);
        $body.on('mousemove',  '.year', showCurrentYearValues);
        $body.on('mouseleave', '.year', hideCurrentYearValues);

        //Eventer Handlers for filtering by year
        $body.on('keyup', 'input', addNewYear);
        $body.on('click', '.year-selection > button', removeSelectedYear);

        init();
    });

    /*******************************************************************
     *                           DATA MODEL                            *
     *******************************************************************/

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
            nino34.originalData = years;
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

    /*******************************************************************
     *                      DISPLAYING DATA                            *
     *******************************************************************/

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
    function drawGraph() {
        var data = currentENSO.data;
        var currentYear = 0,
            yearClass = '';
        var groupWidth = 2 * (currentENSO.scaledMax + spaceBetween/2);

    	for (var j = 0; j < data.length; j++) {
            currentYear = data[j]['year'];
            yearClass = 'year-' + currentYear;

    		var g = svg.append('g')
                .attr('class', 'year')

    		var circles = g.selectAll('circle.mag')
    			.data(data[j]['data'])
    			.enter()
    			.append('circle');

    		var text = g.selectAll('text.value')
    			.data(data[j]['data'])
    			.enter()
    			.append('text');

            var hoverCircles = g.selectAll('circle.hover')
    			.data(data[j]['data'])
    			.enter()
    			.append('circle');

            var bounds = g.selectAll('rect.bounding-box')
                .data(data[j]['data'])
    			.enter()
    			.append('rect');

            circles
    			.attr('cx', xScale(j))
    			.attr('cy',    function(d) { return yScale(d[0])})
    			.attr('r',     function(d) { return rScale(Math.abs(d[1])); })
                .attr('class', function(d) {
                    var classes = yearClass + ' month-' + d[0] + ' mag ' + colorScale(d[1]);
                    return classes;}
                );

    		text
    			.attr('x', function(d) {
                    var x = xScale(j);
                    return d[1] >= 0 ? x - 22 : x - 19;
                })
    			.attr('y', function(d) { return yScale(d[0]) + 5})
    			.text(function(d){
                    var value = d[1].toFixed(2);
                    return value >= 0 ? '+' + value : value;
                })
                .attr('class', function(d) {
                    var classes = yearClass + ' month-' + d[0] + ' value ' + colorScale(d[1]);
                    return classes;}
                );

            hoverCircles
    			.attr('cx', xScale(j))
    			.attr('cy',    function(d) { return yScale(d[0])})
    			.attr('r',     function(d) { return rScale(currentENSO.max) })
                .attr('data-year', currentYear)
                .attr('class', function(d) {
                    var classes = yearClass + ' month-' + d[0] + ' hover ' + colorScale(d[1]);
                    return classes;}
                );

            bounds
    			.attr('x', xScale(j) - currentENSO.scaledMax - spaceBetween)
    			.attr('y',        function(d) { return yScale(d[0]) - currentENSO.scaledMax})
    			.attr('width',     function() { return (currentENSO.scaledMax + spaceBetween) * 2; })
                .attr('height',    function() { return currentENSO.scaledMax * 2; })
                .attr('fill',      'transparent')
                .attr('data-year', currentYear)
                .attr('data-month', function(d){ return d[0]})
                .attr('class',     'bounding-box');
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
        drawGraph();
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

        width = currentENSO.data.length * ((currentENSO.scaledMax + spaceBetween) * 2);
        $graph.width(width);

        xScale = d3.scaleLinear()
            .domain([0, currentENSO.data.length - 1])
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
            .ticks(currentENSO.data.length)
            .tickFormat(function(index) {
                return currentENSO.data[index].year.toString();
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

    /*******************************************************************
     *                    EVENT HANDLERS FUNCTIONS                     *
     *******************************************************************/

    /**
     *  Adds a new selected year on pressing enter in search bar
     */
    function addNewYear(event) {

        // User presses 'Enter'
        if (event.which == 13) {
            let value = parseInt(d3.select(this).node().value);
            let allowedYear = (value > 1949 && value < 2017);
            let newYear = selectedYears.indexOf(value) === -1;
            if (allowedYear && newYear) {
                selectedYears.push(value);
                selectedYears.sort();
                displaySelectedYears();
            }
        }
    }

    /**
     * Called whenever the user clicks the currently hovered value
     */
    function clickMonthAndYear() {
        var index = d3.select(this).attr('data-month') - 1;
        var month = monthNames[index];
        var year = d3.select(this).attr('data-year');
        console.log(month, year);
    }

    function displaySelectedYears() {
        $filter.selectAll('.year-selection').remove();
        for (let i = 0; i < selectedYears.length; i++) {
            let year = selectedYears[i];
            $filter.append('div')
                .attr('class', 'year-selection')
                .html('<span>' + year + '</span><button>X</button>');
        }
        filterData();
    }

    /**
     * Called when entering invisible box for each year,
     * displays the associated values for that year
     */
    function showCurrentYearValues() {
        var g = d3.select(this).node();
        d3.select(g).selectAll('circle.mag').style('opacity', '0');
        d3.select(g).selectAll('text.value').style('opacity', '1');
    }

    /**
     * Called when leaving the invisible box for each year
     */
    function hideCurrentYearValues() {
        var g = d3.select(this).node();
        d3.select(g).selectAll('circle.mag').style('opacity', '1');
        d3.select(g).selectAll('text.value').style('opacity','0');
    }

    /**
     * Shows all of the points in a given row (month)
     */
    function showCurrentMonthValues(evt, a, b) {
        var $this = d3.select(this);

        var year = '.year-' + $this.attr('data-year');
        var month = '.month-' + $this.attr('data-month');

        //Hide all circles for same month
        d3.selectAll('circle.mag' + month).style('opacity', '0');

        //Show all values for same month
        d3.selectAll('text.value' + month).style('opacity', '1');

        //Show hover circle for current month and year
        d3.selectAll('circle.hover' + year + month).style('opacity', '1');
    }

    /**
     * Hides all of the points in a given row/month
     */
    function hideCurrentMonthValues() {
        var month = '.month-' + d3.select(this).attr('data-month');

        //Shows all circles for same month
        d3.selectAll('circle.mag' + month).style('opacity', '1');

        //Hides all values for same month
        d3.selectAll('text.value' + month).style('opacity', '0');

        //Hide hover circle for current month and year
        d3.selectAll('circle.hover').style('opacity', '0');
    }

    function removeSelectedYear() {
        let year = parseInt(d3.select(this.parentNode).select("span").html());
        let index = selectedYears.indexOf(year);
        selectedYears.splice(index, 1);
        displaySelectedYears();
    }

    /**
     * Fades in/out all circles on the graph
     */
    function toggleCircleVisibility() {
        $('circle.mag').toggleClass('fade');
    }

    /*******************************************************************
     *                         FILTERING DATA                          *
     *******************************************************************/


    /**
     * Filters the data based on user input
     */
    function filterData() {
        if (selectedYears.length > 0) {
            currentENSO.data = currentENSO.originalData.filter(function(value) {
                return selectedYears.indexOf(value.year) > -1;
            });
        } else {
            currentENSO.data = currentENSO.originalData;
        }

        setCurrentEnsoMax();
        setYearRange();
        redrawSVG();
    }

    function setCurrentEnsoMax() {
        currentENSO.max = d3.max(currentENSO.data, function(year){
            return d3.max(year.data, function (month) {
                return Math.abs(month[1]);
            });
        });
    }

    function setYearRange() {
        yearRange.start = d3.min(currentENSO.data, function(year){
            return year.year;
        });
        yearRange.end = d3.max(currentENSO.data, function(year){
            return year.year;
        });
    }
})();
