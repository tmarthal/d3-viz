
            // Board parameters
            var w = 500;
            var h = w;
            var spacew = w/8;
            var spaceh = h/8;
            var pad = 1;
            var boardfontsize = 16;

            // Functions to place data / labels / obstacles in correct position on C&L board.
            // The spaces wind up the board from lower left to upper left on 10x10 board.
            function spacex(d,i){
                if(i % 16 < 8){
                	// even rows go left to right
                    return (i*spacew % w);
                }
                else {
                	// odd rows go right to left
                    return (w -spacew - (i*spacew % w));
                }
                //return ((i*spacew % w) - pad);            	
            }
            function spacey(d,i){return (Math.floor(i/8)*spaceh) - pad;}


            //Data
            // Starting board of zeros
            var dataset0 = new Array(64)
            for (var j=0; j < 64; j++){
            	dataset0[j] = 1.0
            }

            // Create SVG of board
            var board = d3.select("#board")
                .append("svg")
                .attr("width",w)
                .attr("height",h);

            // Create spaces on board (rows, then spaces)
            var rects = board.selectAll("rect")
                .data(dataset0)
                .enter()
                .append("rect")
                .attr("x",spacex)
                .attr("y",spacey)
                .attr("width",spacew-2*pad)
                .attr("height",spaceh-2*pad)
                .attr("fill", "white")
                .attr("stroke","silver")
                .attr("stroke-width", 1.0)
                .attr("stroke-opacity", 0.5)
                .attr("shape-rendering", "crispEdges")
                .on("mouseover", function() { d3.select(this).classed("highlight", true); })
                .on("mouseout", function() { d3.select(this).classed("highlight", false); });
//                .on("mouseover", function(){d3.select(this).style("fill", "aliceblue");})
//                .on("mouseout", function(){d3.select(this).style("fill", "white");});


            // Add number labels to each space

            function labelx(d,i){console.log(i); return spacex(d,i) + spacew/2;}
            function labely(d,i){return spacey(d,i) + spaceh/2 + boardfontsize/3;}

            board.selectAll("text")
                .data(dataset0)
                .enter()
                .append("text")
                .text(function(d,i) {return i+1;})
                .attr("text-anchor", "middle")
                .attr("x", labelx)
                .attr("y", labely)
                .attr("font-family", "sans-serif")
                .attr("font-size", boardfontsize)
                .attr("font-weight", "bold")
                .attr("fill", "dimgray");
                //.attr("stroke","silver");

            // Add start and finish labels to board
//            board.append("text")
//                .attr("x", labelx(0,0))
//                .attr("y", labely(0,0)+15)
//                .style("fill", "silver")
//                //.attr("font-weight", "bold")
//                .attr("text-anchor", "middle")
//                .text("Start");
            board.append("text")
                .attr("x", labelx(0,99))
                .attr("y", labely(0,99)-15)
                .style("fill", "silver")
                //.attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .text("Finish");

            // Add start indicator at edge of first space.
            // Remove when animation starts.
            board.append("rect")
                .attr("id","starter")
                .attr("x",spacex(0,0))
                .attr("y",spacey(0,0))
                .attr("width",2)
                .attr("height",spaceh)
                .attr("fill", "none")
                .attr("stroke","red")
                .attr("stroke-width", 2.0)
                .attr("stroke-opacity", 0.5)
                .attr("shape-rendering", "crispEdges");

            function animatestart(){
                d3.select("#starter")
                .transition()
                    .duration(500)
                    .attr("stroke-opacity", 0.0);
                };


            // Loop through JSON imported data
            var colors = ["grey", "yellow", "light-blue", "pink", "dark-blue", "green", "red"]
            d3.json("../data/ng-squares-2007.json", function(json_input) {
            	console.log("json");
            	console.log(json_input);

                var reordered_json = new Array(64);
            	
	            for (var i=0; i<8;i++) {
	            	for (j=0; j<8; j++) {
	            		if(j % 2 == 0) {
	            			console.log((i*8+j) + " " + (j*8+i) + " even");
	            			reordered_json[j*8+i] = json_input[i*8+j];
	            		} else {
	            			console.log((i*8+j) + " " +((j+1)*8-i-1));
	            			reordered_json[(j+1)*8-(i+1)] = json_input[i*8+j];
	            		}
	            	}
	            }
	            
	            rects.data(reordered_json)
	            	.transition()
	                .delay(500)
	                .duration(500)
	                .attr("fill", function(team, i) {
	                	var d = team.wins;
	                	console.log(i + " " + d + " " + colors[d]);
	                	return colors[d];
	                	//return "rgb(" + Math.round(255-d*200.0/1) + "," + Math.round(255-d*200.0/1) + ",255)";
	                });
            });
            

            // Board animation test
            //board.on("click", function(){return animateboardloop(dsets);});

            function animateboardloop(dsets) {
                //console.log(dsets[dset]);
                animatestart();
                for (var k in dsets){
                    animateboard(dsets[k], k);
                    animateline(dsets[k], k);
                    animatecounter(k);
                    animatewin(dsets[k],k);
                    }
            ;}

            function animateboard(dset,k) {
                rects.data(dset)
                .transition()
                    .delay(500*k)
                    .duration(500)
                    //.attr("fill", function(d) {return "rgb(255," + Math.round(255-d*200.0/1) + "," + Math.round(255-d*200.0/1) + ")";}) // Red
                    //.attr("fill", function(d) {return "rgb(" + Math.round(255-d*200.0/1) + "," + Math.round(255-d*200.0/1) + ",255)";}) // Blue
                };


            //------------------------------------------------
            // Create SVG line plot of board probabilities
            var plotsvgheight = 160
            var plotheight = 100
            var plotsvgwidth = w
            var plotwidth = plotsvgwidth - 80


            // X scale will fit values from 1-100 within pixels 0-width
            var x = d3.scale.linear()
                .domain([1, 64])
                .range([0, plotwidth]);
            // Y scale will fit values from 0-1 within pixels 0-100
            var y = d3.scale.linear()
                .domain([0, 1])
                .range([plotheight, 0]);

            // Create a line object
            var line = d3.svg.line()
                .interpolate("basis") // Spline interpolation
                // assign the X function to plot the line
                .x(function(d,i) {return x(i+1);})
                .y(function(d) {return y(d);});


            //--------------------------------------
            // Moves counter
            var counterfontsize = 32;
            var counter = d3.select("#counter")
                .append("svg")
                .attr("width", 2*counterfontsize)
                .attr("height", 1.125*counterfontsize)
                .append("text")
                .text("0")
                .attr("text-anchor", "center")
                .attr("x", counterfontsize/10)
                .attr("y", 1.125*counterfontsize)
                .attr("font-family", "sans-serif")
                .attr("font-size", counterfontsize)
                .attr("font-weight", "bold")
                .attr("fill", "dimgray");

            // Animate counter
            function animatecounter(k) {
                d3.select("#counter text")
                .transition()
                    .delay(500*k)
                    .duration(500)
                    .text(parseInt(k)+1)
                };

            //--------------------------------------
            // Win display (percent chance)
            var counterfontsize = 32;
            var counter = d3.select("#win")
                .append("svg")
                .attr("width", 4.5*counterfontsize)
                .attr("height", 1.125*counterfontsize)
                .append("text")
                .text("0.00%")
                .attr("text-anchor", "center")
                .attr("x", counterfontsize/10)
                .attr("y", 1.125*counterfontsize)
                .attr("font-family", "sans-serif")
                .attr("font-size", counterfontsize)
                .attr("font-weight", "bold")
                .attr("fill", "dimgray");

            // Animate chance
            function animatewin(dset,k) {
                d3.select("#win text")
                .transition()
                    .delay(500*k)
                    .duration(500)
                    .text((parseFloat(dset[99])*100).toFixed(2) + "%")
                };
