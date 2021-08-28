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
        
    ChartGroup.append("text")
        .text(d => d.attr)
        .classed("stateText", true)
    
        //Create group for three y-axis labels
        var labelsGroup = ChartGroup.append("g")
        .attr("transform", "rotate(-90");

        var healthcareLabel = labelsGroup.append("text")
        .attr("x", 20)
        .attr("y",0-margin.left)
        .attr("value", "healthcare")
        .classed("aText",true)
        .text("Lacks Healthcare(%)")

        var smokesLabel = labelsGroup.append("text")
        .attr("x", 40)
        .attr("y",0-margin.left)
        .attr("value", "smokes")
        .classed("aText",true)
        .text("Smokes(%)")
        
        var obesLabel = labelsGroup.append("text")
        .attr("x", 60)
        .attr("y",0-margin.left)
        .attr("value", "obesity")
        .classed("aText",true)
        .text("Obese(%)")


        // append x axis
        ChartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)
        .attr("x", 0)
        .attr("y", 20)
        .attr("dy", "1em")
        .classed("aText", true)
        .text("In Poverty(%)")

        // update ToolTip function above csv import

        var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

        //y axis labels event listener
        labelsGroup.selectAll("text")
        .on("click", function(){
            //get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis){
                //replaces chosenYaxis with value
                chosenYAxis = value;

                //functions here founc above csv import
                //updates y scale for new data
                yLinearScale = yScale(datas, chosenYAxis);

                //updates y axis with transition
                yAxis = renderAxes(yLinearScale, yAxis);

                //updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

                //updates tooltips with new info
                circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                //changes classes to change bold text
                if(chosenYAxis === "healthcare"){
                    smokesLabel
                    .classed("active", ture)
                    .classed("inactive",false);
                    obesLabel
                    .classed("active", ture)
                    .classed("inactive",false);
                }
                if (chosenYAxis === "smokes"){
                    healthcareLabel
                    .classed("active", ture)
                    .classed("inactive",false);
                    obesLabel
                    .classed("active", ture)
                    .classed("inactive",false);
                }
                else{
                    healthcareLabel
                    .classed("active", ture)
                    .classed("inactive",false);
                    smokesLabel
                    .classed("active", ture)
                    .classed("inactive",false);
                }
            }
        })   
}).catch(function(error){
    console.log(error);
})
