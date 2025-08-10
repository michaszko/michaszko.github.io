(function () {
    const width = 800;
    const height = 400;
    const margin = 20

    const svg = d3.select("#increase")
        .attr("viewBox", `0 ${-margin} ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g");

    d3.csv("../other/slope.csv").then(data => {
        data.forEach(d => d.increase = +d.increase);

        const leftValue = 0; // starting value
        const rightValues = data.map(d => d.increase);

        const yScale = d3.scalePoint()
            .domain(data.map(d => d.cat))
            .range([margin, height - margin])
            .padding(0.5);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(rightValues) + 10]) // from 100 to max of right side
            .range([margin, width - margin]);

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
            .text(d => (d.increase).toFixed(0) + "%");

        // Axes (optional)
        // svg.append("g")
        //     .attr("transform", `translate(0,${margin})`)
        //     .call(d3.axisTop(xScale).ticks(5).tickFormat(d => d + "%"));

        svg.append("text")
            // .attr("transform", "rotate(0)")
            .attr("x", width / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("fill", "#456990") // ← text color
            .style("font-size", "16px")
            .text("Percent of institutes with increased funding");

        // --- Animation trigger when visible ---
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate lines growing
                    lines.transition()
                        .duration(1000)
                        .delay((d, i) => i * 150)
                        .attr("x2", d => xScale(d.increase));

                    // Animate right labels sliding into place
                    rightLabels.transition()
                        .duration(1000)
                        .delay((d, i) => i * 150)
                        .style("opacity", 1)
                        .attr("x", d => xScale(d.increase) + 10);

                    observer.disconnect(); // run only once
                }
            });
        }, { threshold: 0.3 });

        observer.observe(document.querySelector("#increase-container"));
    });
})();

