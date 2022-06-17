var dataset = [];
var currentYear;
var hasLoadData = false;
var width = 800;
var height = 600;
var marginLeft = 100;
var marginRight = 100;
var marginBottom = 100;

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
      //console.log("currentYear: ", currentYear);
      hasLoadData = true;

      //group the data, draw one line per group
      sumstat = d3.group(dataset, d => d.name);
      //console.log(sumstat);

      // TODO: merge rows without considering gender
      temp = Array.from(d3.rollup(
        dataset,
        sumstat => {
          const reduce = {...sumstat[0], gender: 0, number: 0};
          for (const {number} of sumstat) {
            reduce.number += number;
          }
          return reduce;
        },
        d => d.name,
        d => d.year
      ));

      temp.forEach(function(e){
        console.log(Array.from(e[1]));
      });
      //console.log(temp);

      // -----------

      xScale = d3.scaleLinear()
            .domain(d3.extent(dataset, (d) => d.year))
            .range([marginLeft, width]);

      yScale = d3.scaleLinear()
            .domain(d3.extent(dataset, (d) => d.number))
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

}
