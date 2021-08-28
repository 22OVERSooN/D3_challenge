var svgWidth = 900;
var svgHeight = 590;

var margin = {
    top:20,
    right:40,
    bottom:180,
    left:100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//append to div classed chart to the scatter element
var chart = d3.select("#scatter").append("div").classed("chart", true)
// Create an SVG wrapper. append and SVG group that wil hold our chart,
// and shift the latter by left and top margins.

var svg = chart
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight);

// Append an SVG group
var ChartGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

//Initial Params
var chosenYAxis = "healthcare";
var chosenXAxis = "poverty"


//function used for updating y-scale var upon click on axis label
function yScale(datas, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(datas, d=>d[chosenYAxis])*0.8,
    d3.max(datas, d=>d[chosenYAxis])*1.2
    ])
    .range([height, 0]);

    return yLinearScale
}
//function used for updating y-scal var upon click on axis lable
function renderAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
    .duration(1000)
    .call(leftAxis);

    return yAxis;
}

//function used for updating state labels with a trasition to new
function renderText(textGroup, newYScale, chosenYAxis){
    textGroup.transition()
    .duration(1000)
    .attr("y", d=> newYScale(d[chosenYAxis]))
    .attr("x", d=> d.poverty);

    return textGroup;
}

//function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newYScale, chosenYAxis){

    circlesGroup.transition()
    .duraion(1000)
    .attr("cy", d=> newYScale(d[chosenYAxis]));

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
        .offset([-8, 0])
        .html(function(d){
            return (`${d.abbr}<br>${label} ${d[chosenYAxis]}<br>Poverty(%)${d.poverty}`);
        });
        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);

            return circlesGroup
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

    var xLinearScale = d3.scaleLinear()
    .domain([8,d3.max(datas, d=>d.poverty)])
    .range([8, width]);

    //Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append y axis
    var yAxis = ChartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis)

    //append x axis 
    ChartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    //append initial circles
    var circlesGroup = ChartGroup.selectAll("circle")
        .data(datas)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true)
        .attr("opacity", ".8")
        
    var textGroup = ChartGroup.selectAll(".stateText")
        .data(datas)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("dy",3)
        .attr("font-size","15px")
        .text(function(d){return d.abbr})
        .classed("stateText", true)
    
        //Create group for three y-axis labels
        var labelsGroup = ChartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

        var healthcareLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y",0-20)
        .attr("dy", "1em")
        .attr("transform","rotate(-90)")
        .classed("aText", true)
        .classed("active", true)
        .attr("value", "healthcare")
        .text("Lacks Healthcare(%)")

        var smokesLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y",0-40)
        .attr("dy", "1em")
        .attr("transform","rotate(-90)")
        .classed("aText", true)
        .classed("active", true)
        .attr("value", "smokes")
        .text("Smokes(%)")
        
        var obesLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y",0-60)
        .attr("dy", "1em")
        .attr("transform","rotate(-90)")
        .classed("aText", true)
        .classed("active", true)
        .attr("value", "obesity")
        .text("Obese(%)")


        // append x axis
        ChartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
        .attr("x", 0)
        .attr("y", 20)
        .classed("aText", true)
        .classed("active", true)
        .attr("value", "poverty")
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
                    healthcareLabel
                    .classed("active", true)
                    .classed("inactive",false);
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive",true);
                    obesLabel
                    .classed("active", false)
                    .classed("inactive",true);
                }
                else if (chosenYAxis === "smokes"){
                    smokesLabel
                    .classed("active", true)
                    .classed("inactive",false);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive",true);
                    obesLabel
                    .classed("active", false)
                    .classed("inactive",true);
                }
                else{
                    obesLabel
                    .classed("active", true)
                    .classed("inactive",false);
                    healthcareLabel
                    .classed("active", false)
                    .classed("inactive",true);
                    smokesLabel
                    .classed("active", false)
                    .classed("inactive",true);
                }
            }
        })   
}).catch(function(error){
    console.log(error);
})
