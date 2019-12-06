callFunction();
function callFunction(){

  var svgtest = d3.select("body").select("svg");
  if (!svgtest.empty()){
    svgtest.remove();
  }


  d3.csv("/Users/llf/Desktop/Sound Analyzer/csvFiles/20191004_002_LLUFTest_ShiviLaura_C100a_001_audiodata.csv")
      .row(function(d){ return {time: Number(d.time), amp: Number(d.amp)};})
      .get(function(error,data){

        var realData = data.slice(1);
        var maxMax = maxIndex(realData,function(d){ return d.amp; });

        var dataInt = realData.slice(maxMax-46,maxMax+46);

        var maxMaxNotI = d3.max(realData,function(d){ return d.amp; });
        var percent = 0.15;
        var extentPercent = (d3.extent(realData,function(d){ return d.amp; })[1]-d3.extent(realData,function(d){ return d.amp; })[0])*percent;

        var myColor = d3.scaleLinear().domain([0,1])
          .range(["yellow", "red"]);

        var a = 100;
        var width = window.innerWidth-a;
        var height = window.innerHeight-a;

        var y = d3.scaleLinear()
          .domain(d3.extent(realData,function(d){ return d.amp; }))
          .range([height,0]);

        var x = d3.scaleLinear()
          .domain(d3.extent(realData,function(d){return d.time;}))
          .range([0,width]);

        var yAxis = d3.axisLeft(y);
        var xAxis = d3.axisBottom(x);

        var svg = d3.select("body").append("svg").attr("width","100%").attr("height","100%");

        var chartGroup = svg.append("g").attr("transform","translate("+a/2+","+a/2+")");

        var clip = svg.append("defs").append("svg:clipPath")
          .attr("id","clip")
          .append("svg:rect")
          .attr("width",width)
          .attr("height",height)
          .attr("x",0)
          .attr("y",0);

        var brush = d3.brushX()
          .extent([[0,0],[width,height]])
          .on("end",updateChart);


        var line = d3.area()
          .curve(d3.curveMonotoneX)
          .x(function(d){ return x(d.time);})
          .y0(-1)
          .y1(function(d){ return y(d.amp);});

        var area = d3.area()
          .curve(d3.curveMonotoneX)
          .x(function(d) { return x(d.time) })
          .y0(height)
          .y1(function(d) { return y(d.amp) })

        var filtArr = relativeMax(realData);

        for (var i = 0; i < filtArr.length; i++) {
          chartGroup.append("path").attr("clip-path","url(#clip)").datum(realData.slice(filtArr[i]-1,filtArr[i]+2)).attr("class","my-area"+i+"").attr("fill",myColor(i/(filtArr.length))).attr("d",area);
        }


        chartGroup.append("path").attr("clip-path","url(#clip)").datum(realData).attr("fill", "white").attr("stroke", "#69b3a2").attr("stroke-width", 1.5).attr("class","my-line").attr("d",line);
        chartGroup.append("g").attr("class","x-axis").call(xAxis).attr("transform","translate(0,"+height+")");
        chartGroup.append("g").attr("class","y-axis").call(yAxis);

        chartGroup.append("g").attr("clip-path","url(#clip)").attr("class","brush").call(brush);

        x.domain(d3.extent(dataInt,function(d){ return d.time; }));

        for (var i = 0; i < filtArr.length; i++) {
          chartGroup.select(".my-area"+i+"").transition().duration(1000).delay(2000).attr("d",area);
        }

        chartGroup.select("g.x-axis").transition().duration(1000).delay(2000).call(xAxis);
        chartGroup.select(".my-line").transition().duration(1000).delay(2000).attr("d",line);

        // function interpolateTurbo (t) {
        //   t = Math.max(0, Math.min(1, t));
        //   return "rgb("
        //     + Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) + ", "
        //     + Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) + ", "
        //     + Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66)))))))
        //     + ")";
        // }

        function maxIndex(values, valueof) {
          let max;
          let maxIndex = -1;
          let index = -1;
          if (valueof === undefined) {
            for (const value of values) {
              ++index;
              if (value != null
                  && (max < value || (max === undefined && value >= value))) {
                max = value, maxIndex = index;
              }
            }
          } else {
            for (let value of values) {
              if ((value = valueof(value, ++index, values)) != null
                  && (max < value || (max === undefined && value >= value))) {
                max = value, maxIndex = index;
              }
            }
          }
          return maxIndex;
        }

        var idleTimeout;
        function idled(){ idleTimeout = null; }

        function updateChart(){
          extent = d3.event.selection;

          if(!extent){
            if(!idleTimeout) return idleTimeout = setTimeout(idled,350);
            x.domain([4,8]);
          } else {
            x.domain([x.invert(extent[0]),x.invert(extent[1])]);
            chartGroup.select(".brush").call(brush.move,null);
          }

          for (var i = 0; i < filtArr.length; i++) {
            chartGroup.select(".my-area"+i+"").transition().duration(1000).attr("d",area);
          }

          chartGroup.select("g.x-axis").transition().duration(1000).call(xAxis);
          chartGroup.select(".my-line").transition().duration(1000).attr("d",line);
        }

        function relativeMax(data){
          var j = 0;
          var newArray = [];
          if(data[0].amp > data[1].amp && data[data.length-1].amp > maxMaxNotI-extentPercent){
            newArray[0] = {time: data[0].time, amp: data[0].amp, index: 0};
            j = 1;
          }
          for (var i = 1; i < data.length-1; i++) {
            if(data[i].amp > data[i+1].amp && data[i].amp > data[i-1].amp && data[i].amp > maxMaxNotI-extentPercent){
              newArray[j] = {time: data[i].time, amp: data[i].amp, index: i};
              j++;
            }
          }
          if(data[data.length-1].amp > data[data.length-2].amp && data[data.length-1].amp > maxMaxNotI-extentPercent){
            newArray[j] = {time: data[data.length-1].time, amp: data[data.length-1].amp, index: data.length-1};
          }

          newArray.sort(function (a, b) {
            return a.amp - b.amp;
          });

          var indexArray = [];
          for (var i = 0; i < newArray.length; i++) {
            indexArray[i] = newArray[i].index;
          }


          return indexArray;
        }

        svg.on("dblclick",function() {
          x.domain(d3.extent(realData,function(d){ return d.time;}));

          for (var i = 0; i < filtArr.length; i++) {
            chartGroup.select(".my-area"+i+"").transition().attr("d",area);
          }

          chartGroup.select("g.x-axis").transition().call(xAxis);
          chartGroup.select(".my-line").transition().attr("d",line);
        });

      });

}
