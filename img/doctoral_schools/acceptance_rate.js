(function () {
    const ORANGE = "#F7941D";
    const BLUE = "#456990"
    const WIDTH = 710, HEIGHT = 500, MARGIN = { top: 40, right: 10, bottom: 60, left: 10 };

    d3.csv("../img/doctoral_schools/SD_.csv").then(raw => {
        // Step 1: Clean up column names (remove weird spaces)
        raw.forEach(d => {
            d["Szkoła"] = d["Szkoła"].trim();
            d["Dyscyplina"] = d["Dyscyplina"].trim();
            d["zakwalifikowany"] = +d["zakwalifikowany"];
        });

        // Step 2: Aggregate totals and accepted counts per Szkoła and Dyscyplina
        const grouped = d3.rollups(
            raw,
            v => ({
                total: v.length,
                accepted: v.filter(d => d.zakwalifikowany === 1).length
            }),
            d => d["Szkoła"],
            d => d["Dyscyplina"]
        );

        // Step 3: Convert to flat array for easier plotting
        const data = [];
        for (const [school, disciplines] of grouped) {
            disciplines.sort((a, b) => b[1].total - a[1].total);
            for (const [disc, vals] of disciplines) {
                data.push({
                    School: school,
                    Discipline: disc,
                    total: vals.total,
                    accepted: vals.accepted
                });
            }
        }

        const schools = Array.from(new Set(data.map(d => d.School)));

        const container = d3.select("#acceptance-container")
            .style("display", "inline-block")
            .style("margin", "auto")
            // .attr("preserveAspectRatio", "xMidYMid meet")
            .style("gap", "30px");

        // Step 4: Create one SVG per school
        schools.forEach((school) => {
            const subset = data.filter(d => d.School === school);

            const svg = container.append("svg")
                .attr("width", WIDTH / 23 * subset.length)
                .style("margin", "auto")
                .attr("height", HEIGHT);

            const innerW = WIDTH / 23 * subset.length - MARGIN.left - MARGIN.right;
            const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;

            const x = d3.scaleBand()
                .domain(subset.map(d => d.Discipline))
                .range([0, innerW])
                .padding(0.4);

            const yMax = d3.max(subset, d => d.total);
            const y = d3.scaleLinear()
                .domain([0, Math.max(90, yMax)])  // like your seaborn ylim
                .range([innerH, 0]);

            const g = svg.append("g")
                .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

            // Total bars (background)
            g.selectAll(".total")
                .data(subset)
                .join("rect")
                .attr("class", "total")
                .attr("x", d => x(d.Discipline))
                .attr("y", y(0))
                .attr("width", x.bandwidth())
                .attr("height", 0)
                .attr("fill", ORANGE)
                .attr("opacity", 0.2);

            // Accepted bars (foreground)
            g.selectAll(".accepted")
                .data(subset)
                .join("rect")
                .attr("class", "accepted")
                .attr("x", d => x(d.Discipline))
                .attr("y", y(0))
                .attr("width", x.bandwidth())
                .attr("height", 0)
                .attr("fill", ORANGE);

            // Labels (percent)
            const labels = g.selectAll(".label")
                .data(subset)
                .join("text")
                .attr("class", "label")
                .attr("x", d => x(d.Discipline) + x.bandwidth() / 2)
                .attr("y", y(0))
                .attr("text-anchor", "middle")
                .attr("fill", BLUE)
                .attr("font-size", "12px")
                .text("");

            // Axis
            g.append("g")
                .attr("transform", `translate(0,${innerH})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(45)")
                .attr("font-size", "12px")
                .style("text-anchor", "start");

            // Animate on scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        g.selectAll(".total")
                            .transition()
                            .duration(1000)
                            .attr("y", d => y(d.total))
                            .attr("height", d => innerH - y(d.total));

                        g.selectAll(".accepted")
                            .transition()
                            .delay(300)
                            .duration(1000)
                            .attr("y", d => y(d.accepted))
                            .attr("height", d => innerH - y(d.accepted));

                        labels.transition()
                            .delay(1500)
                            .duration(800)
                            .tween("text", function (d) {
                                const t = d3.interpolate(0, d.accepted / d.total * 100);
                                return function (tk) {
                                    d3.select(this)
                                        .attr("y", y(d.total) - 5)
                                        .text(d3.format(".0f")(t(tk)) + "%");
                                };
                            });

                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });

            observer.observe(svg.node());
        });
    });

})();
