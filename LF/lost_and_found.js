// Data source: Real-time Tailscale Funnel endpoint on Raspberry Pi
const TAILSCALE_FUNNEL_URL = 'https://pi.tail6998a9.ts.net/lost_items.csv';

// Global state to store data for resizing and toggles
let globalData = {
  dates: [],
  values: [],
  movingAverageData: [],
  monthlyData: [],
  yearlyAverage: 0
};

function initDashboard(data) {
  const { dates, values } = parseCSV(data);
  const movingAverageData = calculateMovingAverage(dates, values, 7);
  const monthlyData = calculateMonthlyAverages(dates, values);
  const yearlyAverage = d3.mean(values);
  
  globalData = { dates, values, movingAverageData, monthlyData, yearlyAverage };
  
  // Initial draw
  drawChart();
  
  // Handle responsiveness
  const resizeObserver = new ResizeObserver(() => {
    drawChart();
  });
  resizeObserver.observe(document.getElementById('chart-container'));

  // Handle all toggles in the legend
  ['daily', 'trend', 'monthly', 'yearly'].forEach(type => {
    d3.select(`#toggle-${type}`).on('change', function() {
      d3.select(`#label-${type}`).classed('off', !this.checked);
      drawChart();
    });
  });
}

// Fetch live from Raspberry Pi via Tailscale Funnel (no local cache/dependence)
d3.csv(`${TAILSCALE_FUNNEL_URL}?t=${Date.now()}`)
  .then(initDashboard)
  .catch(error => console.error('Error loading live data from Raspberry Pi:', error));

function parseCSV(data) {
  const dates = [];
  const values = [];
  const now = new Date();
  const aYearAgo = new Date();
  aYearAgo.setMonth(now.getMonth() - 12);

  data.forEach(row => {
    const d = new Date(row.date);
    if (d >= aYearAgo && d <= now) {
      dates.push(d);
      values.push(+row.value);
    }
  });
  return { dates, values };
}

function calculateMovingAverage(dates, values, windowSize = 7) {
  const result = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < values.length; i++) {
    let sum = 0, count = 0, windowValues = [];
    for (let j = i - halfWindow; j <= i + halfWindow; j++) {
      if (j >= 0 && j < values.length) {
        sum += values[j];
        count++;
        windowValues.push(values[j]);
      }
    }
    const avg = sum / count;
    const variance = windowValues.map(v => Math.pow(v - avg, 2)).reduce((a, b) => a + b, 0) / count;
    const stdDev = Math.sqrt(variance);
    const isAnomaly = values[i] > avg + 2.0 * stdDev && values[i] > 8;

    result.push({ date: dates[i], value: values[i], average: avg, isAnomaly: isAnomaly });
  }
  return result;
}

function calculateMonthlyAverages(dates, values) {
  const months = {};
  dates.forEach((d, i) => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!months[key]) months[key] = { sum: 0, count: 0, date: new Date(d.getFullYear(), d.getMonth(), 1) };
    months[key].sum += values[i];
    months[key].count++;
  });
  return Object.values(months).map(m => ({ date: m.date, average: m.sum / m.count }));
}

function getEaster(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getSpecialDates(startDate, endDate) {
  const yearStart = startDate.getFullYear(), yearEnd = endDate.getFullYear(), events = [];
  const addEvent = (date, label, isRange = false, endDateObj = null) => {
    const d = new Date(date), end = endDateObj ? new Date(endDateObj) : d;
    if (d >= startDate && d <= (endDateObj ? end : d)) events.push({ date: d, label, isRange, endDate: end });
  };
  for (let y = yearStart; y <= yearEnd; y++) {
    addEvent(`${y}-12-24`, 'Winter Holiday', true, new Date(y + 1, 0, 6));
    addEvent(`${y}-05-01`, 'May Break', true, `${y}-05-03`);
    addEvent(`${y}-08-15`, 'Assumption');
    addEvent(`${y}-11-01`, 'All Saints');
    addEvent(`${y}-11-11`, 'Independence');
    const easter = getEaster(y), easterMon = new Date(easter); easterMon.setDate(easter.getDate() + 1);
    addEvent(easter, 'Easter', true, easterMon);
    const corpusChristi = new Date(easter); corpusChristi.setDate(easter.getDate() + 60);
    addEvent(corpusChristi, 'Corpus Christi');
    addEvent(`${y}-06-25`, 'Summer Break', true, `${y}-07-05`);
  }
  return events;
}

function drawChart() {
  const { dates, values, movingAverageData, monthlyData, yearlyAverage } = globalData;
  if (!dates.length) return;

  const showDaily = d3.select('#toggle-daily').property('checked');
  const showTrend = d3.select('#toggle-trend').property('checked');
  const showMonthly = d3.select('#toggle-monthly').property('checked');
  const showYearly = d3.select('#toggle-yearly').property('checked');

  const container = d3.select('#chart-container'), width = container.node().clientWidth - 48, height = Math.min(window.innerHeight * 0.6, 500), margin = { top: 60, right: 30, bottom: 50, left: 50 }, innerWidth = width - margin.left - margin.right, innerHeight = height - margin.top - margin.bottom;
  
  const svg = d3.select('#chart'); svg.selectAll('*').remove();
  svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
  
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleTime().domain(d3.extent(dates)).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, d3.max(values) * 1.2]).range([innerHeight, 0]).nice();

  // Defs & Gradient
  const defs = svg.append('defs'), gradient = defs.append('linearGradient').attr('id', 'area-gradient').attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f39c12').attr('stop-opacity', 0.4);
  gradient.append('stop').attr('offset', '100%').attr('stop-color', '#f39c12').attr('stop-opacity', 0.0);

  // Annotations
  const specialDates = getSpecialDates(d3.min(dates), d3.max(dates)), annotations = g.append('g').attr('class', 'annotations');
  specialDates.forEach(d => {
    const xPos = xScale(d.date), xEnd = d.isRange ? xScale(d.endDate) : xPos + 2;
    annotations.append('rect').attr('x', xPos).attr('y', 0).attr('width', Math.max(2, xEnd - xPos)).attr('height', innerHeight).attr('fill', '#e74c3c').attr('opacity', 0.1);
    if (width > 600) annotations.append('text').attr('x', xPos).attr('y', -15).attr('font-size', '10px').attr('fill', '#e74c3c').attr('opacity', 0.8).attr('transform', `rotate(-30, ${xPos}, -15)`).text(d.label);
  });

  // Grid & Axes
  g.append('g').attr('class', 'grid')
    .call(d3.axisLeft(yScale).ticks(3).tickSize(-innerWidth).tickFormat(''))
    .style('stroke', '#ccc')
    .style('opacity', 0.2);

  g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).ticks(width > 600 ? 10 : 5).tickFormat(d3.timeFormat('%b %d'))).style('font-size', '12px').style('color', '#888').call(g => g.select('.domain').remove());
  g.append('g').call(d3.axisLeft(yScale).ticks(3)).style('font-size', '12px').style('color', '#888').call(g => g.select('.domain').remove());

  // Conditional Rendering
  const curve = d3.curveMonotoneX;

  // 1. Daily Data Line
  if (showDaily) {
    const dailyLine = d3.line().x(d => xScale(d.date)).y(d => yScale(d.value)).curve(curve);
    g.append('path').datum(movingAverageData).attr('fill', 'none').attr('stroke', '#4a90e2').attr('stroke-width', 1).attr('stroke-opacity', 0.2).attr('d', dailyLine);
    
    // Anomaly markers only make sense if daily data is shown
    g.selectAll('.anomaly').data(movingAverageData.filter(d => d.isAnomaly)).enter().append('circle').attr('cx', d => xScale(d.date)).attr('cy', d => yScale(d.value)).attr('r', 4).attr('fill', 'none').attr('stroke', '#e74c3c').attr('stroke-width', 2);
  }

  // 2. 7-day Trend Area and Line
  if (showTrend) {
    const area = d3.area().x(d => xScale(d.date)).y0(innerHeight).y1(d => yScale(d.average)).curve(curve);
    const trendLine = d3.line().x(d => xScale(d.date)).y(d => yScale(d.average)).curve(curve);
    g.append('path').datum(movingAverageData).attr('fill', 'url(#area-gradient)').attr('d', area);
    g.append('path').datum(movingAverageData).attr('fill', 'none').attr('stroke', '#f39c12').attr('stroke-width', 3).attr('d', trendLine);
  }

  // 3. Yearly Baseline
  if (showYearly) {
    g.append('line').attr('x1', 0).attr('x2', innerWidth).attr('y1', yScale(yearlyAverage)).attr('y2', yScale(yearlyAverage)).attr('stroke', '#27ae60').attr('stroke-width', 2).attr('opacity', 0.6);
  }

  // 4. Monthly Averages (Stepped)
  if (showMonthly) {
    const monthlyLine = d3.line().x(d => xScale(d.date)).y(d => yScale(d.average)).curve(d3.curveStepAfter);
    g.append('path').datum(monthlyData).attr('fill', 'none').attr('stroke', '#9b59b6').attr('stroke-width', 2).attr('opacity', 0.6).attr('d', monthlyLine);
  }

  // Interactivity
  const tooltip = d3.select('#tooltip'), bisectDate = d3.bisector(d => d.date).left, focus = g.append('g').style('display', 'none');
  focus.append('line').attr('y1', 0).attr('y2', innerHeight).attr('stroke', '#ccc').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');
  
  // Snap color based on priority
  const focusCircle = focus.append('circle').attr('r', 5).attr('stroke', 'white').attr('stroke-width', 2);

  g.append('rect').attr('width', innerWidth).attr('height', innerHeight).style('fill', 'none').style('pointer-events', 'all')
    .on('mouseover', () => { if (showDaily || showTrend || showMonthly || showYearly) { focus.style('display', null); tooltip.style('opacity', 1); } })
    .on('mouseout', () => { focus.style('display', 'none'); tooltip.style('opacity', 0); })
    .on('mousemove', (event) => {
      if (!showDaily && !showTrend && !showMonthly && !showYearly) return;
      
      const x0 = xScale.invert(d3.pointer(event)[0]), i = bisectDate(movingAverageData, x0, 1), d0 = movingAverageData[i - 1], d1 = movingAverageData[i], d = (d0 && d1 && x0 - d0.date > d1.date - x0) ? d1 : d0 || d1;
      if (!d) return;

      focus.attr('transform', `translate(${xScale(d.date)},0)`);
      
      // Determine where to snap the focus dot
      let snapY = 0;
      if (showTrend) {
        snapY = yScale(d.average);
        focusCircle.attr('fill', '#f39c12').attr('cy', snapY);
      } else if (showDaily) {
        snapY = yScale(d.value);
        focusCircle.attr('fill', '#4a90e2').attr('cy', snapY);
      } else if (showMonthly) {
        const mAvg = monthlyData.find(m => m.date.getMonth() === d.date.getMonth() && m.date.getFullYear() === d.date.getFullYear())?.average || 0;
        snapY = yScale(mAvg);
        focusCircle.attr('fill', '#9b59b6').attr('cy', snapY);
      } else if (showYearly) {
        snapY = yScale(yearlyAverage);
        focusCircle.attr('fill', '#27ae60').attr('cy', snapY);
      }

      const eventInfo = specialDates.find(e => new Date(e.date).toDateString() === d.date.toDateString());
      let tooltipContent = `<div class="tooltip-date">${d3.timeFormat('%B %d, %Y')(d.date)} ${eventInfo ? `<br><span style="color:#e74c3c;font-size:0.8rem;">📍 ${eventInfo.label}</span>` : ''}</div>`;
      
      if (showDaily) tooltipContent += `<div class="tooltip-value"><span>Daily:</span><strong>${d.value}</strong></div>`;
      if (showTrend) tooltipContent += `<div class="tooltip-value" style="color:#f39c12"><span>7-day Avg:</span><strong>${d.average.toFixed(1)}</strong></div>`;
      if (showMonthly) {
        const mAvg = monthlyData.find(m => m.date.getMonth() === d.date.getMonth() && m.date.getFullYear() === d.date.getFullYear())?.average || 0;
        tooltipContent += `<div class="tooltip-value" style="color:#9b59b6"><span>Monthly Avg:</span><strong>${mAvg.toFixed(1)}</strong></div>`;
      }
      if (showYearly) tooltipContent += `<div class="tooltip-value" style="color:#27ae60"><span>Yearly Avg:</span><strong>${yearlyAverage.toFixed(1)}</strong></div>`;
      if (showDaily && d.isAnomaly) tooltipContent += `<div style="color:#e74c3c;font-weight:bold;margin-top:4px;font-size:0.8rem;">⚠️ Unusual Peak</div>`;
      
      tooltip.style('left', event.pageX + 'px').style('top', (event.pageY - 15) + 'px').html(tooltipContent);
    });
}
