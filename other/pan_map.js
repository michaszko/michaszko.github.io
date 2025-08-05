const width = 640, height = 600;
const svg = d3.select("#map");
const g = svg.append("g");

let points, markers;
let currentZoomLevel = 1;

// Color scale for categories
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Money scale for circle radius
const moneyScale = d3.scalePow().exponent(1 / 2).range([3, 20]); // domain set after loading data


// Projection & path
const projection = d3.geoMercator()
    .center([19.1451, 52.237])  // Center of Poland
    .scale(3000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("text-align", "center")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid #999")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px")
    .style("font-family", "'Rubik', sans-serif")
    .style("opacity", 0);

const majorCities = [
    // { name: "Warszawa", lon: 21.0122, lat: 52.2297 },
    // { name: "Kraków", lon: 19.9445, lat: 50.0647 },
    // { name: "Łódź", lon: 19.4572, lat: 51.7592 },
    // { name: "Wrocław", lon: 17.0385, lat: 51.1079 },
    // { name: "Poznań", lon: 16.9252, lat: 52.4064 },
    // { name: "Gdańsk", lon: 18.6466, lat: 54.3520 },
    // { name: "Lublin", lon: 22.5667, lat: 51.2500 },
    // { name: "Białystok", lon: 23.1688, lat: 53.1325 }
];

// --- Placement function: non-overlapping circles
function placeCirclesNoOverlap(data, zoomLevel) {
    const sorted = [...data].sort((a, b) => moneyScale(b.money) - moneyScale(a.money));
    const placed = [];

    sorted.forEach(d => {
        let r = moneyScale(d.money) / zoomLevel;
        let [x, y] = projection([d.lon, d.lat]);

        let step = 1, angle = 0;
        while (placed.some(p => {
            const dx = p.x - x, dy = p.y - y;
            return Math.sqrt(dx * dx + dy * dy) < p.r + r;
        })) {
            angle += 0.3;
            x += Math.cos(angle) * step;
            y += Math.sin(angle) * step;
            step += 0.1;
        }

        d.x = x; d.y = y; d.r = r;
        placed.push(d);
    });
}

// --- Load data
Promise.all([
    d3.json("../other/poland.geojson"),      // GeoJSON of Poland
    d3.csv("../other/pan_institutes.csv")        // CSV with lon, lat, money, cat
]).then(([poland, data]) => {
    points = data.map(d => ({
        ...d,
        lon: +d.lon,
        lat: +d.lat,
        money: +d.money,
        cat: d.cat
    }));

    moneyScale.domain(d3.extent(points, d => d.money));

    // --- Draw Poland
    g.append("g")
        .selectAll("path")
        .data(poland.features)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", "#f2f2f2")
        .attr("stroke", "#555")
        .attr("stroke-width", 1);

    const cityGroup = g.append("g").attr("class", "cities");

    cityGroup.selectAll("circle")
        .data(majorCities)
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.lon, d.lat])[0])
        .attr("cy", d => projection([d.lon, d.lat])[1])
        .attr("r", 4)
        .attr("fill", "#000")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);

    cityGroup.selectAll("text")
        .data(majorCities)
        .enter()
        .append("text")
        .attr("x", d => projection([d.lon, d.lat])[0] + 6)
        .attr("y", d => projection([d.lon, d.lat])[1] + 3)
        .text(d => d.name)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#000")
        .style("pointer-events", "none");

    // --- Place points initially
    placeCirclesNoOverlap(points, 1);

    markers = g.selectAll("circle")
        .data(points)
        .enter().append("circle")
        .attr("class", "marker")
        .attr("fill", d => color(d.cat))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 0)  // start small
        .on("mouseover", function (event, d) {
            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`<b>${d.name}</b><br>${d.cat}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Run the intro animation separately
    markers.transition()
        .duration(800)
        .delay((d, i) => i * 20)
        .ease(d3.easeElasticOut)
        .attr("r", d => d.r);

    // --- Legend
    const categories = Array.from(new Set(points.map(d => d.cat)));
    createLegend(categories);

    // --- Zoom
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            currentZoomLevel = event.transform.k;
            g.attr("transform", event.transform);
            updateMarkerPositions();
            cityGroup.selectAll("circle")
                .attr("r", 6 / currentZoomLevel);

            cityGroup.selectAll("text")
                .attr("x", d => projection([d.lon, d.lat])[0] + 6 / currentZoomLevel)
                .attr("y", d => projection([d.lon, d.lat])[1] + 3 / currentZoomLevel)
                .style("font-size", `${12 / currentZoomLevel * 3 / 2}px`);
        });
    svg.call(zoom);
    svg.on("dblclick.zoom", null);

});

// --- Update positions after zoom or filter
function updateMarkerPositions() {
    const visiblePoints = points.filter(d => !d.hidden);
    placeCirclesNoOverlap(visiblePoints, currentZoomLevel);

    // Show visible
    markers.filter(d => !d.hidden)
        .attr("display", null)
        .transition()
        .duration(600)
        .ease(d3.easeCubicOut)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => moneyScale(d.money) / currentZoomLevel);

    // Hide with shrink
    markers.filter(d => d.hidden)
        .transition()
        .duration(400)
        .attr("r", 0)
        .on("end", function () { d3.select(this).attr("display", "none"); });
}

// --- Legend with toggles
function createLegend(categories) {
    const legendWidth = 150;
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("font-size", "10px")
        .attr("coursor", "pointer")
        .attr("font-family", "'Rubik', sans-serif")
        .attr("transform", `translate(${(width - legendWidth) / 2}, ${height})`);

    categories.forEach((cat, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`)
            .style("cursor", "pointer");

        row.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color(cat))
            .attr("stroke", "#333");

        row.append("text")
            .attr("x", 24)
            .attr("y", 14)
            .text(cat)
            .attr("class", "legend-label");

        row.on("click", () => {
            const isHidden = points.some(p => p.cat === cat && !p.hidden);
            points.forEach(p => { if (p.cat === cat) p.hidden = isHidden; });
            markers.attr("display", d => d.hidden ? "none" : null);
            updateMarkerPositions();
        });
    });
}