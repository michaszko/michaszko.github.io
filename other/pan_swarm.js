(function () {
    const width = 800;
    const height = 600;
    const margin = 10

    const svg = d3.select("#swarm")
        .attr("viewBox", `0 0 ${width + margin} ${height + margin}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g");

    // Load CSV
    d3.csv("../other/pan_institutes.csv").then(data => {
        // Convert numeric
        data.forEach(d => d.money = +d.money / 1000);

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

        // Extract categories
        const categories = Array.from(new Set(data.map(d => d.cat)));

        // Scales
        const xScale = d3.scalePoint()
            .domain(categories)
            .range([0, width])
            .padding(0.5);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.money)]).nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(categories)
            .range(d3.schemeTableau10);

        const radius = 6;

        // Beeswarm simulation
        const simulation = d3.forceSimulation(data)
            .force("x", d3.forceX(d => xScale(d.cat)).strength(1))
            .force("y", d3.forceY(d => yScale(d.money)).strength(1))
            .force("collide", d3.forceCollide(radius + 0.5))
            .stop();

        for (let i = 0; i < 200; ++i) simulation.tick();

        // Draw circles
        const circles = g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 0)
            .attr("fill", d => color(d.cat))
            .attr("opacity", 0.9)
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`<b>${d.name}</b>`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });

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

        observer.observe(document.querySelector("#swarm-container"));

        g.append("g")
            .attr("transform", `translate(${50},${0})`)
            .style("font-size", "16px")
            .call(d3.axisLeft(yScale).ticks(5));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", margin+2)
            .attr("text-anchor", "middle")
            .attr("fill", "#456990") // ← text color
            .style("font-size", "16px")
            .text("Dotation (in mln zł)");

        // Legend
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 320}, 30)`);
        categories.forEach((cat, i) => {
            const row = legend.append("g")
                .attr("transform", `translate(0, ${i * 20})`);
            row.append("rect")
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", color(cat));
            row.append("text")
                .attr("x", 18)
                .attr("y", 10)
                .text(cat)
                .attr("fill", "#456990")
                .style("font-size", "16px");
        });
    });
})();