(function () {

    const width = 800;
    const height = 600;
    const margin = 30;

    const svg = d3.select("#scatter")
        .attr("viewBox", `${-margin} ${-margin} ${width + 2 * margin} ${height + 2 * margin}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g");

    d3.csv("../other/pan_institutes.csv").then(data => {
        data.forEach(d => {
            d.Yi = +d.Yi;
            d.proc = +d.proc;
            d.cat = d.cat;
            d.name = d.name;
        });
        const categories = Array.from(new Set(data.map(d => d.cat)));

        // Color scale similar to matplotlib tab10 first 5 colors
        const colorScale = d3.scaleOrdinal()
            .domain(categories)
            .range(d3.schemeTableau10.slice(0, 5));

        const tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("text-align", "center")
            .style("opacity", 0.1)
            .style("background", "#E8E9EB")
            .style("padding", "5px")
            .style("border", "1px solid #999")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("font-size", "12px")
            .style("font-family", "'Rubik', sans-serif");

        // const margin = { top: 20, right: 40, bottom: 200, left: 40 },
        //     width = 680 - margin.left - margin.right,
        //     height = 600 - margin.top - margin.bottom;

        // const svg = d3.select("#scatter")
        //     .append("svg")
        //     .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.top + margin.bottom)
        //     .append("g")
        //     .attr("transform", `translate(${margin.left},${margin.top})`);

        // X scale
        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Yi))
            .nice()
            .range([margin, width - margin]);

        // Y scale
        const y = d3.scaleLinear()
            .domain([-1, 11])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(${margin},0)`)
            .call(d3.axisLeft(y).ticks(5))
            .style("font-size", "16px");

        const specialTicks = [0.75, 1, 1.25, 1.75]; // your chosen tick values
        const tickLabels = ["B", "B+", "A", "A+"];

        svg.selectAll(".vert-lines")
            .data(specialTicks)
            .enter()
            .append("line")
            .attr("x1", d => x(d))
            .attr("x2", d => x(d))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "gray")
            .attr("stroke-dasharray", "4,4");

        svg.selectAll(".vert-labels")
            .data(specialTicks)
            .enter()
            .append("text")
            .attr("x", d => x(d))
            .attr("y", height + 20) // above the axis
            .attr("text-anchor", "middle")
            .text(d => tickLabels[specialTicks.indexOf(d)])
            .style("font-size", "16px")
            .style("fill", "#456990") // ← text color
            .style("font-family", "'Rubik', sans-serif");

        const radius = 6;

        const simulation = d3.forceSimulation(data)
            .force("x", d3.forceX(d => x(d.Yi)).strength(0.1))
            .force("y", d3.forceY(d => y(d.proc)).strength(0.1))
            .force("collide", d3.forceCollide(radius + 1)) // 5 is radius + padding
            .stop();

        // Run the simulation manually for stability
        for (let i = 0; i < 120; i++) simulation.tick();

        // Points
        const circles = svg.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 0)
            .attr("fill", d => colorScale(d.cat))
            .attr("opacity", 0.9)
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`<b>${d.name}</b><br>${d.cat}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        svg.append("text")
            .attr("x", -height / 2)
            .attr("y", 2)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .text("Zmiana (%)")
            .style("font-size", "16px")
            .style("fill", "#456990") // ← text color
            .style("font-family", "'Rubik', sans-serif");

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    circles.transition()
                        .duration(800)
                        .delay((d, i) => i * 20)
                        .ease(d3.easeElasticOut)
                        .attr("r", radius);
                    observer.disconnect(); // run only once
                }
            });
        }, { threshold: 0.7 }); // start when 30% of plot is visible

        observer.observe(document.querySelector("#scatter-container"));

        // Assuming you already have your categories and colors
        let activeCategories = new Set(categories); // start with all categories visible

        const legend = svg.selectAll(".legend")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`)
            .style("cursor", "pointer")
            .on("click", function (event, category) {
                if (activeCategories.has(category)) {
                    activeCategories.delete(category);
                } else {
                    activeCategories.add(category);
                }

                // Toggle point visibility
                svg.selectAll("circle")
                    .style("opacity", d => activeCategories.has(d.cat) ? 1 : 0.1);

                // Dim legend squares
                legend.selectAll("rect")
                    .style("opacity", d => activeCategories.has(d) ? 1 : 0.3);
            });

        // Legend color box
        legend.append("rect")
            .attr("x", width / 2 - 100)
            .attr("y", height + 50)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", d => colorScale(d));

        // Legend text
        legend.append("text")
            .attr("x", width / 2 - 100 + 26)
            .attr("y", height + 50 + 6)
            .attr("dy", ".35em")
            .text(d => d)
            .style("font-size", "14px")
            .style("fill", "#456990") // ← text color
            .style("font-family", "'Rubik', sans-serif");
    });
})();
