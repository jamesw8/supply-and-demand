var svg = d3.select("svg"),
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width = +svg.attr("width") - margin.left - margin.right,
	height = +svg.attr("height") - margin.top - margin.bottom;

	
let supply_points = [[50, 50], [150, 150]];
let demand_points = [[50,150], [150, 50]];

let y_diff, x_diff;

y_diff = supply_points[1][1] - supply_points[0][1];
x_diff = supply_points[1][0] - supply_points[0][0];
let supply_line_length = Math.sqrt((x_diff * x_diff) + (y_diff * y_diff));

y_diff = demand_points[1][1] - demand_points[0][1];
x_diff = demand_points[1][0] - demand_points[0][0];
let demand_line_length = Math.sqrt((x_diff * x_diff) + (y_diff * y_diff));
	
var x = d3.scaleLinear()
	.rangeRound([0, width]);

var y = d3.scaleLinear()
	.rangeRound([height, 0]);

var xAxis = d3.axisBottom(x),
	yAxis = d3.axisLeft(y);

var supply_line = d3.line()
	.x(function(d) { return x(d[0]); })
	.y(function(d) { return y(d[1]); });
var demand_line = d3.line()
	.x(function(d) { return x(d[0]); })
	.y(function(d) { return y(d[1]); });
	
let sdrag = d3.drag()
	.on('start', dragstarted)
	.on('drag', sdragged)
	.on('end', dragended);
let ddrag = d3.drag()
	.on('start', dragstarted)
	.on('drag', ddragged)
	.on('end', dragended);
let sshift = d3.drag()
	.on('start', dragstarted)
	.on('drag', sshifted)
	.on('end', dragended);
let dshift = d3.drag()
	.on('start', dragstarted)
	.on('drag', dshifted)
	.on('end', dragended);
	
svg.append('rect')
	.attr('class', 'zoom')
	.attr('fill', 'none')
	.attr('pointer-events', 'all')
	.attr('width', width)
	.attr('height', height)
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var focus = svg.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
let range_ = [[0,0], [200, 200]];
x.domain(d3.extent(range_, function(d) { return d[0]; }));
y.domain(d3.extent(range_, function(d) { return d[1]; }));

let demand_path = focus.append("path")
	.datum(demand_points)
	.attr("id", "demand")
	.attr("fill", "none")
	.attr("stroke", "#A00000")
	.attr("stroke-linejoin", "round")
	.attr("stroke-linecap", "round")
	.attr("stroke-width", 10.0)
	.attr('cursor', 'pointer')
	.attr("d", demand_line)
	.call(dshift);

let supply_path = focus.append("path")
	.datum(supply_points)
	.attr("id", "supply")
	.attr("fill", "none")
	.attr("stroke", "#009933")
	.attr("stroke-linejoin", "round")
	.attr("stroke-linecap", "round")
	.attr("stroke-width", 10.0)
	.attr('cursor', 'pointer')
	.attr("d", supply_line)
	.call(sshift);

let supply_circles = focus.selectAll('#supply_circles')
	.data(supply_points)
	.enter()
	.append('circle')
	.attr('class', 'supply')
	.attr('r', 20.0)
	.attr('cx', function(d) { return x(d[0]);  })
	.attr('cy', function(d) { return y(d[1]); })
	.style('cursor', 'pointer')
	.style('fill', '#009933');

supply_circles.call(sdrag);

let demand_circles = focus.selectAll('#demand_circles')
	.data(demand_points)
	.enter()
	.append('circle')
	.attr('class', 'demand')
	.attr('r', 20.0)
	.attr('cx', function(d) { return x(d[0]);  })
	.attr('cy', function(d) { return y(d[1]); })
	.style('cursor', 'pointer')
	.style('fill', '#A00000');

demand_circles.call(ddrag);

focus.append('g')
	.attr('class', 'axis axis--x')
	.attr('transform', 'translate(0,' + height + ')')
	.call(xAxis);
	
focus.append('g')
	.attr('class', 'axis axis--y')
	.call(yAxis);
	
focus.append("text")
	.attr("x", (width / 2))             
	.attr("y", 0)
	.attr("text-anchor", "middle")  
	.style("font-size", "24px") 
	.text("Supply and Demand Graph");

focus.append("text")             
	.attr("transform",
			"translate(" + (width/2) + " ," + 
						   (height + margin.top + 5) + ")")
  .style("text-anchor", "middle")
  .text("Quantity");

focus.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 0 - margin.left)
	.attr("x",0 - (height / 2))
	.attr("dy", "1em")
	.style("text-anchor", "middle")
	.text("Price");

let horizontal = focus.append("line")          // attach a line
	.style("stroke", "black")  // colour the line
	.attr("x1", x(0))     // x position of the first end of the line
	.attr("y1", y(50))      // y position of the first end of the line
	.attr("x2", x(50))     // x position of the second end of the line
	.attr("y2", y(50));

let vertical = focus.append("line")
	.style("stroke", "black")  // colour the line
	.attr("x1", x(50))     // x position of the first end of the line
	.attr("y1", y(50))      // y position of the first end of the line
	.attr("x2", x(50))     // x position of the second end of the line
	.attr("y2", height);  
	
let eq_point = focus.append('circle')
	.attr('r', 20.0)
	.attr('cx', function(d) { return x(find_intersection(supply_points, demand_points)[0]);  })
	.attr('cy', function(d) { return y(find_intersection(supply_points, demand_points)[1]); })
	.style('fill', 'black');

update_equilibrium(supply_points, demand_points);
	
let last_x;
function dragstarted(d) {
	d3.select(this).raise().classed('active', true);
	last_x = x.invert(d3.event.x);
}

function sdragged(d) {
	let other;
	if (d == supply_points[0])
		other = 1;
	else if (d == supply_points[1])
		other = 0;
	
	let x0 = supply_points[other][0];
	let y0 = supply_points[other][1];
	let x1 = x.invert(d3.event.x);
	let y1 = y.invert(d3.event.y);
	let v1 = x1 - x0;
	let v2 = y1 - y0;
	let distance = Math.sqrt((v1 * v1) + (v2 * v2));
	let unit_vector = [v1/distance, v2/distance];
	let new_x1 = x0 + (supply_line_length * unit_vector[0]);
	let new_y1 = y0 + (supply_line_length * unit_vector[1]);
	let x_in_range = range_[0][0] <= new_x1 && range_[1][0] >= new_x1;
	let y_in_range = range_[0][1] <= new_y1 && range_[1][1] >= new_y1;
		
	if (!x_in_range || !y_in_range) 
		return false;
	
	d[0] = new_x1;
	d[1] = new_y1;
	d3.select(this)
		.attr('cx', x(d[0]))
		.attr('cy', y(d[1]))
	supply_path.attr('d', supply_line);
	update_equilibrium(supply_points, demand_points);
}

function ddragged(d) {
	let other;
	if (d == demand_points[0])
		other = 1;
	else if (d == demand_points[1])
		other = 0;
	
	let x0 = demand_points[other][0];
	let y0 = demand_points[other][1];
	let x1 = x.invert(d3.event.x);
	let y1 = y.invert(d3.event.y);
	let v1 = x1 - x0;
	let v2 = y1 - y0;
	let distance = Math.sqrt((v1 * v1) + (v2 * v2));
	let unit_vector = [v1/distance, v2/distance];
	let new_x1 = x0 + (demand_line_length * unit_vector[0]);
	let new_y1 = y0 + (demand_line_length * unit_vector[1]);
	let x_in_range = range_[0][0] <= new_x1 && range_[1][0] >= new_x1;
	let y_in_range = range_[0][1] <= new_y1 && range_[1][1] >= new_y1;
		
	if (!x_in_range || !y_in_range) 
		return false;
	
	d[0] = new_x1;
	d[1] = new_y1;
	d3.select(this)
		.attr('cx', x(d[0]))
		.attr('cy', y(d[1]))
	demand_path.attr('d', demand_line);
	update_equilibrium(supply_points, demand_points);
}

function sshifted(l) {
	let d_line_slope = find_line(demand_points[0], demand_points[1])[0];
	let possible = true;
	supply_circles
		.each(function(d, i) {
		let cx = d[0];
		let cy = d[1];
		let x_difference = x.invert(d3.event.x) - last_x;
		let y_difference = d_line_slope * x_difference;
		let x_in_range = (range_[0][0] <= (cx + x_difference)) && (range_[1][0] >= (cx + x_difference));
		let y_in_range = range_[0][1] <= (cy + y_difference) && range_[1][1] >= (cy + y_difference);
		
		if (!possible || !x_in_range || !y_in_range) {
			possible = false;
			return possible;
		}
	});
	
	if (!possible)
		return false;
	
	supply_circles
		.each(function(d, i) {
		let cx = d[0];
		let cy = d[1];
		let x_difference = x.invert(d3.event.x) - last_x;
		let y_difference = d_line_slope * x_difference;
		
		d3.select(this)
			.attr('cx', x(cx + x_difference))
			.attr('cy', y(cy + y_difference));
		l[i][0] = (cx + x_difference);
		l[i][1] = (cy + y_difference);
		supply_path.attr('d', supply_line);
	});
	last_x = x.invert(d3.event.x);
	update_equilibrium(supply_points, demand_points);
}

function dshifted(l) {
	let s_line_slope = find_line(supply_points[0], supply_points[1])[0];
	let possible = true;
	demand_circles
		.each(function(d, i) {
		let cx = d[0];
		let cy = d[1];
		let x_difference = x.invert(d3.event.x) - last_x;
		let y_difference = s_line_slope * x_difference;
		let x_in_range = (range_[0][0] <= (cx + x_difference)) && (range_[1][0] >= (cx + x_difference));
		let y_in_range = range_[0][1] <= (cy + y_difference) && range_[1][1] >= (cy + y_difference);
		
		if (!possible || !x_in_range || !y_in_range) {
			possible = false;
			return possible;
		}
	});
		if (!possible)
			return false;
		
		demand_circles
			.each(function(d, i) {
		let cx = d[0];
		let cy = d[1];
		let x_difference = x.invert(d3.event.x) - last_x;
		let y_difference = s_line_slope * x_difference;

		d3.select(this)
			.attr('cx', x(cx + x_difference))
			.attr('cy', y(cy + y_difference));
		l[i][0] = (cx + x_difference);
		l[i][1] = (cy + y_difference);
		demand_path.attr('d', demand_line);
	});
	last_x = x.invert(d3.event.x);
	update_equilibrium(supply_points, demand_points);
}
	
function dragended(d) {
	d3.select(this).classed('active', false);
}

function find_line(point_a, point_b) {
	let slope = (point_b[1] - point_a[1])/(point_b[0] - point_a[0]);
	let y_intercept = point_a[1] - (slope * point_a[0]);
	return [slope, y_intercept];
}
	
function find_intersection(s_points, d_points) {
	s_line = find_line(s_points[0], s_points[1]);
	d_line = find_line(d_points[0], d_points[1]);
	let x = (d_line[1] - s_line[1])/(s_line[0] - d_line[0]);
	let y = x * d_line[0] + d_line[1];
	return [x, y];
}

function update_equilibrium(s_points, d_points) {
	let intersection = find_intersection(s_points, d_points);
	eq_point.attr("cx", x(intersection[0]));
	eq_point.attr("cy", y(intersection[1]));
	horizontal.attr("y1", y(intersection[1]));
	horizontal.attr("y2", y(intersection[1]));
	horizontal.attr("x2", x(intersection[0]));
	vertical.attr("x1", x(intersection[0]));
	vertical.attr("x2", x(intersection[0]));
	vertical.attr("y1", y(intersection[1]));
}