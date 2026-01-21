(function () {

    const BLUE = "#456990";
    const RED = "#d55f5f";
    const GREEN = "#44BBA4";
    const ORANGE = "#F09D51";
    const palette = { 0: RED, 1: GREEN, 2: ORANGE, 3: RED };
    const WIDTH = 700, HEIGHT = 500, MARGIN = { top: 40, right: 10, bottom: 60, left: 10 };

    d3.csv("../img/doctoral_schools/SD_.csv").then(df => {
        // Step 1: Clean up column names (remove weird spaces)
        df.forEach(d => {
            d["Szkoła"] = d["Szkoła"].trim();
            d["Dyscyplina"] = d["Dyscyplina"].trim();
            d["zakwalifikowany"] = +d["zakwalifikowany"];
            d["Wynik"] = +d["Wynik"];
        });

        const szkoly = Array.from(new Set(df.map(d => d.Szkoła)));
        const dyscypliny = Array.from(new Set(df.map(d => d.Dyscyplina)));
        const MAX = 100;

        const container = d3.select("#scatter_all-container")
            .style("display", "inline-block")
            .style("margin", "auto")
            // .style("gap", "30px");

        const svg = container.append("svg")
            .attr("width", WIDTH)
            .style("margin", "auto")
            .attr("height", HEIGHT);

        const g = svg.append("g");
            // .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

        const x = d3.scaleLinear().domain([-1, MAX + 1]).range([MARGIN.left, WIDTH - MARGIN.right]);

        const yBand = d3.scaleBand()
            .domain(dyscypliny)
            .range([MARGIN.top, HEIGHT - MARGIN.bottom])
            .padding(0.5);

        // Add vertical dashed lines
        [25, 50, 75].forEach(v => {
            g.append("line")
                .attr("x1", x(v))
                .attr("x2", x(v))
                .attr("y1", MARGIN.top)
                .attr("y2", HEIGHT - MARGIN.bottom)
                .attr("stroke", BLUE)
                .attr("stroke-dasharray", "4 2")
                .attr("stroke-width", 1)
                .attr("opacity", 0.3);
        });

        // Group by Dyscyplina
        const grouped = d3.group(df, d => d.Dyscyplina);

        // Plot each discipline
        for (const [disc, points] of grouped.entries()) {
            const y0 = yBand(disc) + yBand.bandwidth() / 2;
            const jitterScale = 1.5;

            g.selectAll(`.point-${disc}`)
                .data(points)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.Wynik))
                .attr("cy", d => y0 + (Math.random() - 0.5) * jitterScale)
                .attr("r", 4)
                .attr("fill", d => palette[d.zakwalifikowany])
                .attr("opacity", 0.7);

            // Label on the right
            g.append("text")
                .attr("x", x(MAX + 5))
                .attr("y", y0)
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "middle")
                .attr("font-size", "10px")
                .text(disc)
                .attr("fill", BLUE);
        }

        // Top axis (like tick_top)
        const xAxisTop = d3.axisTop(x)
            .tickValues(d3.range(0, MAX + 1, MAX / 4))
            .tickSize(0);
        g.append("g")
            .attr("transform", `translate(0, ${MARGIN.top})`)
            .call(xAxisTop)
            .call(g => g.selectAll("text").attr("font-size", "10px"))
            .call(g => g.selectAll("path,line").remove());

    });

})();
