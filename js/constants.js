//Set month names
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Create discretizied diverging color scale
// Colors taken from Cynthia Brewer's "ColorBrewer." Diverging, 6-step blue-red.
var colors = ['level-0', 'level-1', 'level-2', 'level-3', 'level-4', 'level-5'];
// Range denotes discretized bins (min to -2.51 is first HEX, -2.5 to -2.01 is next, etc.)
var oniRange = [-2, -1, 0, 1, 2, 3];
var colorScale = d3.scaleThreshold()
    .domain(oniRange)
    .range(colors);


//Initial year range
var yearRange = {
    start : 1950,
    end   : 2016
};
