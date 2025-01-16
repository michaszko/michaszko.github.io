const csvFileName = 'LF/lost_items.csv'; // The relative path to your CSV file on the server

d3.csv(csvFileName).then(data => {
  const { dates, values } = parseCSV(data);
  const weeklyData = calculateWeeklyAverage(dates, values);
  plotChart(dates, values, weeklyData);
}).catch(error => console.error('Error loading CSV file:', error));

function parseCSV(data) {
  const dates = [];
  const values = [];

  data.forEach(row => {
    dates.push(new Date(row.date));
    values.push(+row.value);
  });

  return { dates, values };
}

function calculateWeeklyAverage(dates, values) {
  const weeklyAverages = [];
  const weeklyDates = [];
  let currentWeek = [];
  let currentValues = [];

  dates.forEach((date, index) => {
    const currentDate = date;
    const currentWeekday = currentDate.getDay(); // Sunday=0, Monday=1, etc.
    currentWeek.push(currentDate);
    currentValues.push(values[index]);

    if (currentWeekday === 6 || index === dates.length - 1) { // End of the week (Saturday) or last point
      const average = currentValues.reduce((sum, val) => sum + val, 0) / currentValues.length;

      // Set the weekly average on Sunday
      const sunday = new Date(currentDate);
      sunday.setDate(currentDate.getDate() - currentDate.getDay() + 3); // Set to Sunday
      // Actually set it to Wednesdays so its the middle of the week

      weeklyAverages.push(average);
      weeklyDates.push(sunday); // Set to Sunday of the week
      currentWeek = [];
      currentValues = [];
    }
  });

  return { dates: weeklyDates, averages: weeklyAverages };
}

function plotChart(dates, values, weeklyData) {
  const svg = d3.select('#chart');

  // Get the full screen width and height
  const width = window.innerWidth*0.8;  // Subtract margin space
  const height = window.innerHeight*0.8;  // Subtract margin space

  svg.attr('width', width).attr('height', height);

  const margin = { top: 20, right: 50, bottom: 40, left: 50 };
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Apply global font styles to the entire plot
  svg.style('font-family', 'Rubik, sans-serif')  // Change font family
    .style('font-size', '16px');  // Change font size

  // Scales
  // const xDailyScale = d3.scaleTime().domain(d3.extent(dates)).range([0, width - margin.left - margin.right]);
  const xDailyScale = d3.scaleTime()
    .domain([
      d3.timeWeek.offset(d3.min(dates), -1),  // One week before the minimum date
      d3.timeWeek.offset(d3.max(dates), 1)    // One week after the maximum date
    ])
    .range([0, width - margin.left - margin.right]);
  const yScale = d3.scaleLinear().domain([d3.min(values)-5, d3.max(values)]).range([height - margin.top - margin.bottom, 0]);

  // Axes
  const xDailyAxis = d3.axisBottom(xDailyScale);
    // .ticks(d3.timeDay.every(5))
    // .tickFormat(d3.timeFormat('%b %d'));
  const yAxis = d3.axisLeft(yScale);

  // Daily line
  const lineDaily = d3.line()
    .x(d => xDailyScale(d))
    .y((d, i) => yScale(values[i]));

  // Weekly average line
  const lineWeekly = d3.line()
    .x(d => xDailyScale(d))
    .y((d, i) => yScale(weeklyData.averages[i]));

  // Daily data line
  g.append('path')
    .data([dates])
    .attr('class', 'line')
    .attr('d', lineDaily)
    .style('fill', 'none')
    .style('stroke', 'steelblue')
    .style('stroke-width', 2)
    .style('stroke-opacity', 0.3); // Make the blue line transparent


  // Weekly data line
  g.append('path')
    .data([weeklyData.dates])
    .attr('class', 'line')
    .attr('d', lineWeekly)
    .style('fill', 'none')
    .style('stroke', 'orange')
    .style('stroke-width', 3);

  // Add markers (circles) for daily data points
  g.selectAll('.daily-marker')
    .data(dates)
    .enter().append('circle')
    .attr('class', 'daily-marker')
    .attr('cx', d => xDailyScale(d))
    .attr('cy', (d, i) => yScale(values[i]))
    .attr('r', 4)  // Size of the marker
    .style('fill', function(d) {
      const dayOfWeek = d.getDay();
      // Saturday (6) and Sunday (0)
      if (dayOfWeek === 6) {
        return 'green'; // Saturday - green
      } else if (dayOfWeek === 0) {
        return 'red'; // Sunday - red
      } else {
        return 'steelblue'; // Weekdays - default color
      }
    })
    .style('stroke', 'white')
    .style('stroke-width', 1)
    .style('fill-opacity', 0.6); // Make the blue line transparent

  // Add markers (circles) for weekly data points
  g.selectAll('.weekly-marker')
    .data(weeklyData.dates)
    .enter().append('circle')
    .attr('class', 'weekly-marker')
    .attr('cx', d => xDailyScale(d))
    .attr('cy', (d, i) => yScale(weeklyData.averages[i]))
    .attr('r', 6)  // Size of the marker
    .style('fill', 'orange')
    .style('stroke', 'white')
    .style('stroke-width', 1);

  // X axis for daily data
  g.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
    .call(xDailyAxis)
    .selectAll('text')
    .style('text-anchor', 'middle')
    .style('font-size', '16px');
    // .attr('transform', 'rotate(-45)');

  // Y axis
  g.append('g')
    .attr('class', 'y axis')
    .call(yAxis)
    .selectAll('text')
    .style('font-size', '16px')  // Increase font size of y ticks
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('Value');

  // Add legend
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${margin.left + 120}, 20)`);  // Adjust position

  // Legend for Daily Data
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', 'steelblue');
  legend.append('text')
    .attr('x', 30)
    .attr('y', 15)
    .style('font-size', '16px')
    .text('Daily Data');

  // Legend for Weekly Average
  legend.append('rect')
    .attr('x', 0)
    .attr('y', 30)
    .attr('width', 20)
    .attr('height', 20)
    .style('fill', 'orange');
  legend.append('text')
    .attr('x', 30)
    .attr('y', 45)
    .style('font-size', '16px')
    .text('Weekly Average');
}

