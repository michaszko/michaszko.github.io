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
            d["KM"] = d["KM"].trim();
        });

        // Step 2: Aggregate totals and accepted counts per Szkoła and Dyscyplina
        const grouped = d3.rollups(
            raw,
            v => ({
                total: v.length,
                accepted: v.filter(d => d.zakwalifikowany === 1).length
            }),
            d => d["Szkoła"],
            d => d["Dyscyplina"],
            d => d["KM"]
        );

        // Step 3: Convert to flat array for easier plotting
        const data = [];
        for (const [school, disciplines] of grouped) {

            // compute total per discipline to sort
            const disciplineTotals = disciplines.map(([disc, genders]) => {
                const total = d3.sum(genders, g => g[1].total);
                return { disc, total };
            });
            const order = disciplineTotals
                .sort((a, b) => b.total - a.total)
                .map(d => d.disc);

            // flatten data in sorted order
            for (const disc of order) {
                const genders = disciplines.find(d => d[0] === disc)[1];
                genders.sort((a, b) => {
                    if (a[0] === b[0]) return 0;
                    return a[0] === "m" ? -1 : 1;
                });
                console.log(genders);
                for (const [KM, vals] of genders) {
                    data.push({
                        Szkoła: school,
                        Dyscyplina: disc,
                        KM,
                        total: vals.total,
                        accepted: vals.accepted
                    });
                }
            }
        }

        const schools = [...new Set(data.map(d => d.Szkoła))];
        const container = d3.select("#km-container")
            .style("display", "inline-block")
            .style("margin", "auto")
            // .attr("preserveAspectRatio", "xMidYMid meet")
            .style("gap", "30px");

        // Define color mapping for gender
        const color = d3.scaleOrdinal()
            .domain(["m", "k"])
            .range(["#456990", "#f67280"]); // example blue/pink palette

        schools.forEach((school) => {
            const tooltip = d3.select("body").append("div")
                .style("position", "absolute")
                .style("text-align", "center")
                .style("opacity", 0.1)
                .style("background", "#E8E9EB")
                .style("padding", "1px")
                .style("line-height", "1.2")
                // .style("border", "1px solid #999")
                .style("border-radius", "4px")
                .style("pointer-events", "none")
                .style("font-size", "12px")
                .style("fill", ORANGE)
                .style("font-family", "'Rubik', sans-serif");
            const df = data.filter(d => d.Szkoła === school);
            const disciplines = [...new Set(df.map(d => d.Dyscyplina))];
            const km = [...new Set(df.map(d => d.KM))];

            const innerW = WIDTH / 46 * df.length - MARGIN.left - MARGIN.right;
            const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;

            const svg = container.append("svg")
                .attr("width", WIDTH / 46 * df.length)
                .style("margin", "auto")
                .attr("height", HEIGHT);

            const g = svg.append("g")
                .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

            const x0 = d3.scaleBand()
                .domain(disciplines)
                .range([0, innerW])
                .paddingInner(0.2);

            const x1 = d3.scaleBand()
                .domain(km)
                .range([0, x0.bandwidth()])
                .padding(0.05);

            const yMax = d3.max(df, d => d.total);
            const y = d3.scaleLinear()
                .domain([0, yMax])  // like your seaborn ylim
                .range([innerH, 0]);

            // Background bars (totals)
            g.selectAll(".total")
                .data(df)
                .join("rect")
                .attr("class", "total")
                .attr("x", d => x0(d.Dyscyplina) + x1(d.KM))
                .attr("y", d => y(d.total))
                .attr("width", x1.bandwidth())
                .attr("height", d => innerH - y(d.total))
                .attr("fill", d => color(d.KM))
                .attr("opacity", 0.2)
                .on("mouseover", function (event, d) {
                    const percent = d.total ? Math.round((d.accepted / d.total) * 100) : 0;
                    const col = color(d.KM);
                    console.log(col);
                    tooltip.transition().duration(150).style("opacity", 1).style("color", col) // readable text;
                    tooltip.html(`<b>${percent}%</b>`);
                    d3.select(this).attr("opacity", 0.3);
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 28 + "px");
                })
                .on("mouseout", function () {
                    tooltip.transition().duration(200).style("opacity", 0);
                    d3.select(this).attr("opacity", 0.2);
                });

            // Foreground bars (accepted)
            g.selectAll(".accepted")
                .data(df)
                .join("rect")
                .attr("class", "accepted")
                .attr("x", d => x0(d.Dyscyplina) + x1(d.KM))
                .attr("y", d => y(d.accepted))
                .attr("width", x1.bandwidth())
                .attr("height", d => innerH - y(d.accepted))
                .attr("fill", d => color(d.KM))
                .attr("opacity", 0.9)
                .on("mouseover", function (event, d) {
                    const percent = d.total ? Math.round((d.accepted / d.total) * 100) : 0;
                    const col = color(d.KM);
                    // console.log(col);
                    tooltip.transition().duration(150).style("opacity", 1).style("color", col) // readable text;
                    tooltip.html(`<b>${percent}%</b>`);
                    d3.select(this).attr("opacity", 0.7);
                })
                .on("mousemove", function (event) {
                    tooltip.style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY - 28 + "px");
                })
                .on("mouseout", function () {
                    tooltip.transition().duration(200).style("opacity", 0);
                    d3.select(this).attr("opacity", 0.8);
                });


            // Add percentage labels
            // const labels = g.selectAll(".label")
            //     .data(df)
            //     .join("text")
            //     .attr("x", d => x0(d.Dyscyplina) + x1(d.KM) + x1.bandwidth() / 2)
            //     .attr("y", d => y(d.total) + 5)
            //     // .attr("transform", "rotate(0)")
            //     .attr("text-anchor", "middle")
            //     .attr("font-size", "10px")
            //     .attr("fill", BLUE)
            //     .attr("transform", d => {
            //         const xx = x0(d.Dyscyplina) + x1(d.KM) + x1.bandwidth()/10;
            //         const yy = y(d.total) + 5;
            //         console.log(xx, yy);
            //         return `rotate(90, ${xx}, ${yy})`;  // rotate around (x, y)
            //     })
            //     .text(d => d.total ? `${Math.round((d.accepted / d.total) * 100)}%` : "");

            // Axes
            g.append("g")
                .attr("transform", `translate(0,${innerH})`)
                .call(d3.axisBottom(x0))
                .selectAll("text")
                .attr("transform", "rotate(45)")
                .attr("font-size", "12px")
                .style("text-anchor", "start");

            // svg.append("text")
            //     .attr("x", width / 2)
            //     .attr("y", -5)
            //     .attr("text-anchor", "middle")
            //     .text(school)
            //     .style("font-weight", "bold");
        });
    });

})();
