

function myFunction() {

    var svgtest = d3.select("body").select("svg");
    if (!svgtest.empty()){
      svgtest.remove();
    }
    
    var divornot = d3.select("body").selectAll(".slope-text");
    if (!divornot.empty()){
      divornot.remove();
    }

    var text = document.getElementById("frm1").elements[0].value;

    var equation = new Function("t","return "+text);

    var data = [];

    for (var i = 0; i < 1921; i++) {
      data[i] = i/32-30;
    }

    var a = 200;
    var height = window.innerHeight-a;
    var width = window.innerWidth-a;

    var margin = {left:a/2,right:a/2,top:a/4,bottom:0};

    var x = d3.scaleLinear()
                .domain(d3.extent(data))
                .range([0,width]);

    var y = d3.scaleLinear()
                .domain(d3.extent(data))
                .range([height,0]);

    var tooltip = d3.select("body").append("div").attr("class","slope-text").attr("id","myDiv").style("opacity","0").style("position","absolute");

    var yAxis = d3.axisLeft(y);
    var xAxis = d3.axisBottom(x);

    var line = d3.line()
                    .x(function(d,i){ if(!y(equation(d))== null){return x(d);} })
                    .y(function(d,i){ if(!y(equation(d))== null){return y(equation(d));} })
                    .curve(d3.curveCardinal);

    var tangent = d3.line()
                    .x(function(d,i){ return x(d); })
                    .y(function(d,i){ return y(equation(d+ Math.pow(-1,i)*5)+Math.pow(-1,i)*-5*(equation(d+ Math.pow(-1,i)*5+0.001)-equation(d+ Math.pow(-1,i)*5-0.001))/0.002); })
                    .curve(d3.curveCardinal);

    var dragHandler = d3.drag()
        .on("drag", function () {

            var xPosition = d3.event.x*(d3.extent(data)[1]-d3.extent(data)[0])/width-d3.max(data);
            d3.select(this)
                .attr("cx", x(xPosition))
                .attr("cy", y(equation(xPosition)));
            svg.selectAll("path.tangent")
                .attr("d",tangent([-5+xPosition,5+xPosition]));
            svg.selectAll("circle.frame")
              .attr("cx", x(xPosition))
              .attr("cy", y(equation(xPosition)));
            svg
                .on("mousemove",function(){
                    tooltip.style("opacity","1").style("left", x(xPosition)+a/2+"px").style("top",y(equation(xPosition))+a/2+"px");
                    var slope = (equation(xPosition+0.001)-equation(xPosition-0.001))/0.002;
                    tooltip.html("Slope: "+ slope.toFixed(3)+"<br>("+xPosition.toFixed(3)+", "+equation(xPosition).toFixed(3)+")");
                    });
//            svg.selectAll("circle.first").on("mouseout",function(){
//                tooltip.style("opacity",0);
//            });
        });

    var svg = d3.select("body").append("svg").attr("height","100%").attr("width","100%");
    var chartGroup = svg.append("g").attr("transform","translate("+margin.left+","+margin.top+")");

    chartGroup.append("g")
        .append("rect")
        .attr("class","rectangle")
        .attr("fill","white")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);
                                               
    chartGroup.append("g")
          .attr("class","axis y")
          .attr("transform","translate("+width/2+",0)")
          .call(yAxis);
    chartGroup.append("g")
          .attr("class","axis x")
          .attr("transform","translate(0,"+height/2+")")
          .call(xAxis);

    chartGroup.append("path")
          .attr("fill","none")
          .attr("stroke","blue")
          .attr("d",line(data));

    chartGroup.append("clipPath")
          .attr("id", "circle-clip")
          .append("circle")
          .attr("class","frame")
          .attr("cx", x(0))
          .attr("cy", y(equation(0)))
          .attr("r","100");

    chartGroup.append("path")
          .attr("class","tangent")
          .attr("fill","none")
          .attr("stroke","green")
          .attr("d",tangent([-5,5]))
          .attr("clip-path","url(#circle-clip)");
    
    chartGroup.append("circle")
         .attr("class","first")
         .attr("fill","red")
         .attr("cx",x(0))
         .attr("cy",y(equation(0)))
         .attr("r","5");


    dragHandler(svg.selectAll("circle"));
}
