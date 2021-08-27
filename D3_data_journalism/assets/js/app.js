var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top:20,
    right:40,
    bottom:80,
    left:100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper. append and SVG group that wil hold our chart,
// and shift the latter by left and top margins.

var svg = d3
.select("#scatter")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

// Append an SVG group
var ChartGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

//Initial Params
var chosenYAxis = "poverty";

//function used for updating y-scal var upon click on axis lable
//function yScale()

//Retrive data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(datas, err){
    if (err) throw err;
    for (var i = 0; i < data.length; i++) {
        console.log(datas[i].poverty);}
})
