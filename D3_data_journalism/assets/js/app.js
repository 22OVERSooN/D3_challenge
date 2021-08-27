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
var chosenYAxis = "healthcare";

//function used for updating y-scale var upon click on axis label
function yScale(datas, chosenYAxis) {
    var yLinearScale = d3.scaleLiniear()
    .domain([d3.min(data, d=>[chosenYAxis])*0.8,
    d3.max(data, d=>[chosenYAxis])*1.2
    ])
    .range([0, width]);

    return yLinearScale
}
//function used for updating y-scal var upon click on axis lable
function rendenAxes(newYScale, yAxis) {
    var leftAxis = d3.axisleft(newYScale);

    yAxis.transition()
    .duration(1000)
    .call(leftAxis);

    return yAxis;
}

//function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newYScale, chosenYAxis){

    circlesGroup.transition()
    .duraion(1000)
    .attr("cx", d=> newYScale(d[chosenYAxis]));
    //<----add the d.abbr here and put into the circle

    return circlesGroup;
}

//function used for updating circles group with new tooltip
function updateToolTip(chosenYAxis, circlesGroup) {
    var label;
    if(chosenYAxis === "healthcare"){
        label = "Lacks Healthcare(%)";
    }
    if(chosenYAxis === "smokes"){
        label = "Smokes(%)";
    }
    else {
        label = "Obese(%)";
    }
    var toolTip= d3.tip()
        .attr("class","d3-tip")
        .offset([80, -60])
        .html(function(d){
            return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
        });
        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data){
            toolTip.show(data)
        })
        .on("mouseout", function(data,index){
            toolTip.hide(data);

            return circlesGroup
        })
}
//Retrive data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(datas, err){
    if (err) throw err;

    //parse data from str to int
    datas.forEach(function(data){
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = data.smokes
    });

    //yLinearScale function above csv import
    var yLinearScale = yScale(datas, chosenYAxis)

    var xLinearScale = d3.scaleLiniear()
    .domain([0,d3.max(datas, d=>d.poverty)])
    .range([height, 0]);

    //Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisleft(yLinearScale);

    // append y axis
    var yAxis = ChartGroup.append("g")
    .classed("aText", true)
    .attr("transform", `translate(0, ${height})`)
    .call(leftAxis)

    //append y axis 
    ChartGroup.append("g")
    .call(bottomAxis);

    //append initial circles
    var circlesGroup = ChartGroup.selectAll("circle")
        .data(datas)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .classed("stateText stateCircle", true)
})
