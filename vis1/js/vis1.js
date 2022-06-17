var dataset = [];
var currentYear;
var hasLoadData = false;
var width = 800;
var height = 600;
var marginLeft = 100;
var marginRight = 100;
var marginBottom = 100;

// key is name+'_'+year
// value is data {name, year, number}
function GetMergeDataSet() {
  newDataSet = {}; // not considering gender&year

  for(var i in dataset){
    var name = dataset[i].name;
    var year = dataset[i].year;
    var number = dataset[i].number;
    // console.log('name:', name, ', year:', year, 'number:', number);
    //console.log(i);
    var key = name + '_' + year;
    if(!(key in newDataSet)){
      newDataSet[key] = {
        'name': name,
        'year': year,
        'number': 0 // if not exist in dict, just create initial data with number = 0
      };
    }
    newDataSet[key].number += number;
  }
  //--- doing this to get the same format as the output of d3.tsv
  //console.log(newDataSet);
  res = [];
  for(var i in newDataSet){
    res.push(newDataSet[i]);
  }
  newDataSet = res;
  //---
  return newDataSet;
}

let svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

let tooltip = d3.select("body")
                 .append("div")
                  .style("width", "140px")
                  .style("height", "18px")
                  .style("position", "absolute")
                  .style("background", "#fffdcf")
                  //.style("text-align", "center")
                  .style("border", "1px solid lightgrey")
                  .style("border-radius", "8px")
                  .style("font", "11px sans-serif")
                  .style("padding-top", "6px")
                  .style("padding-left", "12px")
                  .style("opacity", 0);

// prepare data
d3.tsv("data/nat1900-2017.tsv", (d, i) => {
            return {
                gender: +d['sexe'],
                name: d['preusuel'],
                year: +d['annais'],
                number: +d['nombre']
            };
      })
.then((rows) => {
   console.log(`Loaded ${rows.length} rows.`);
   if (rows.length > 0) {
      dataset = rows.filter(function(d){
                if(isNaN(d.year)){
                  return false;
                }
                if(isNaN(d.number)){
                    return false;
                }
                if(d.name == "_PRENOMS_RARES"){
                    return false;
                }
                return true;
            });
      console.log(`dataset length is  ${dataset.length}.`);

      // //console.log("First row: ", dataset[0]);
      // //console.log("Last row: ", dataset[dataset.length-1]);

      currentYear = dataset[0].year;
      //console.log(dataset[0]);
      //console.log("currentYear: ", currentYear);
      hasLoadData = true;
      newDataSet = GetMergeDataSet();
      newDataSet.sort(function(x , y){
        return d3.ascending(x.year, y.year);
      });
      /*newDataSet.forEach(function(e){
        if (e.name == "JEANNE")
          console.log(e);
      })*/
      //console.log(newDataSet);
      //console.log(newDataSet['MARIE_1900']);

      //group the data, draw one line per group
      sumstat = d3.group(newDataSet, d => d.name);

      xScale = d3.scaleLinear()
            .domain(d3.extent(newDataSet, (d) => d.year))
            .range([marginLeft, width]);

      yScale = d3.scaleLinear()
            .domain(d3.extent(newDataSet, (d) => d.number))
            .range([height - marginBottom, 0]);

      xAxis = d3.axisBottom(xScale)
                .ticks(width / 100);

      yAxis = d3.axisLeft(yScale)
                .ticks(height / 60);

      lineChart();
   }
}).catch( (error) => {
    console.log("Something went wrong", error);
});

function lineChart(){

  svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom +1})`)
        .call(xAxis);

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis);

  svg.selectAll(".line")
      .data(sumstat)
      .join("path")
        .attr("fill", "none")
        //.attr("id", function(d) { return "line-"+ d.name;})
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          //console.log(d);
          return d3.line()
            .x(function(d) {
              //if(d.name == "MARIE") console.log(d);
              return xScale(d.year); })
            .y(function(d) { return yScale(d.number); })
            (d[1])
        })
        .on("mouseover", function(e, d){
          tooltip.transition()
             .duration(50)
             .style("opacity", 0.95);
          tooltip.html("<b>Name : </b>" + d[0])
             .style("left", (event.pageX + 5) + "px")
             .style("top", (event.pageY + 5) +"px");

          const selection = d3.select(this).raise();
          selection.transition()
                   .duration(50)
                   .style("opacity", 1)
                   .style("stroke", "#2596be");
          })
        .on("mouseout", function(e) {
          tooltip.transition()
             .duration(600)
             .style("opacity", 0);

         const selection = d3.select(this);
         selection.transition()
                  .duration(600)
                  .style("opacity", 1)
                  .style("stroke", "lightgrey");
        });

}

function searchByName(){
  const val = (document.getElementById('searchName').value).toUpperCase();
  console.log(val);
  if (newDataSet.filter(e => (e.name).toUpperCase() === val).length > 0){
  //  console.log(d3.selectAll("path"));
      //.style("stroke", "#2596be");
  }
}
