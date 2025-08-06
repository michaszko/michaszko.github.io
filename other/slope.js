(function () {
    const width = 680, height = 400, margin = { top: 50, right: 20, bottom: 50, left: 20 };
    const svg = d3.select("#slope")
        .attr("width", width)
        .attr("height", height);

    d3.csv("../other/slope.csv").then(data => {
        data.forEach(d => d.percent = +d.percent);

        const leftValue = 1; // starting value
        const rightValues = data.map(d => 1 + d.percent);

        const yScale = d3.scalePoint()
            .domain(data.map(d => d.cat))
            .range([margin.top, height - margin.bottom])
            .padding(0.5);

        const xScale = d3.scaleLinear()
            .domain([1, d3.max(rightValues)]) // from 100 to max of right side
            .range([margin.left, width - margin.right]);

        const color = d3.scaleOrdinal(d3.schemeTableau10).domain(data.map(d => d.cat));

        // Draw slope lines
        const lines = svg.selectAll("line.slope")
            .data(data)
            .enter()
            .append("line")
            .attr("class", "slope")
            .attr("x1", xScale(leftValue))
            .attr("y1", d => yScale(d.cat))
            .attr("x2", d => xScale(leftValue))
            .attr("y2", d => yScale(d.cat))
            .attr("stroke", d => color(d.cat))
            .attr("stroke-width", 8);

        // Left labels
        // svg.selectAll(".left-label")
        //     .data(data)
        //     .enter()
        //     .append("text")
        //     .attr("class", "left-label")
        //     .attr("x", xScale(leftValue) - 10)
        //     .attr("y", d => yScale(d.cat) + 4)
        //     .attr("text-anchor", "end")
        //     .attr("fill", d => color(d.cat))
        //     .attr("font-size", "12px")
        //     .text(d => d.cat);

        // Right labels
        const rightLabels = svg.selectAll(".right-label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "right-label")
            .attr("x", d => xScale(leftValue) + 10)
            .attr("y", d => yScale(d.cat) + 4)
            .attr("text-anchor", "start")
            .attr("fill", d => color(d.cat))
            .text(d => (d.percent).toFixed(1) + "%");

        // Axes (optional)
        svg.append("g")
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisTop(xScale).ticks(5).tickFormat(d => d + "%"));

        svg.append("text")
            // .attr("transform", "rotate(0)")
            .attr("x", width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("fill", "#456990") // ← text color
            .style("font-size", "14px")
            .text("Change 2024 vs 2025");

        // --- Animation trigger when visible ---
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate lines growing
                    lines.transition()
                        .duration(1000)
                        .delay((d, i) => i * 150)
                        .attr("x2", d => xScale(d.percent));

                    // Animate right labels sliding into place
                    rightLabels.transition()
                        .duration(1000)
                        .delay((d, i) => i * 150)
                        .style("opacity", 1)
                        .attr("x", d => xScale(d.percent) + 10);

                    observer.disconnect(); // run only once
                }
            });
        }, { threshold: 0.3 });

        observer.observe(document.querySelector("#slope-container"));
    });
})();

