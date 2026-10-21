/**
 * Interactive Research Map of Visited Places - Eckert IV Projection
 * Author: Michał Siemaszko
 */

(function () {
  const width = 960;
  const height = 520;

  const places = [
    {
      id: "warsaw",
      name: "Warsaw",
      country: "Poland",
      region: "europe",
      coords: [21.0122, 52.2297],
      dx: 8,
      dy: -6,
      anchor: "start",
      role: "PhD Candidate · Conference Organizer · Seminar Speaker",
      years: "2021 – 2027",
      events: [
        { year: "2021 – 2027", category: "Education", title: "PhD in Computer Science", detail: "University of Warsaw (MIM UW). Research on photonic quantum computing, reservoir computing & quantum memristors supervised by Prof. Magdalena Stobińska." },
        { year: "03/2026", category: "Talk", title: "Quantum Infinity for You", detail: "Talk: Introduction to gate-based quantum computing at Faculty of Physics (FUW)." },
        { year: "10/2025", category: "Talk", title: "Quantum Information Seminar", detail: "Talk: Neuromorphic computing with quantum memristors at Faculty of Physics (FUW)." },
        { year: "05/2025", category: "Conference", title: "QUACC+ (Quantum Certification Conference+)", detail: "Poster: Time series prediction with photonic quantum memristors." },
        { year: "12/2025", category: "School", title: "Winter Innovation School", detail: "Doctoral school winter school in Warsaw." },
        { year: "06/2024", category: "Conference", title: "Masovian Symposium on Quantum, Optical & Atomic Physics", detail: "Poster: Time series prediction with quantum memristor." },
        { year: "06/2024", category: "School", title: "Mid-Infrared Quantum Sensing School", detail: "Summer school at Faculty of Physics (FUW), University of Warsaw." },
        { year: "10/2024", category: "Organization", title: "Skłodowska Quantum Conference", detail: "Co-organizer; created conference website, program schedule, and participant badges." },
        { year: "11/2022", category: "Talk", title: "Information Theory Seminar", detail: "Talk: Introduction to quantum computing at MIM UW." }
      ]
    },
    {
      id: "wroclaw",
      name: "Wrocław",
      country: "Poland",
      region: "europe",
      coords: [17.0385, 51.1079],
      dx: -8,
      dy: -6,
      anchor: "end",
      role: "B.Sc. & M.Sc. Studies · Research Assistant",
      years: "2015 – 2021",
      events: [
        { year: "2018 – 2021", category: "Education", title: "M.Sc. in Theoretical Physics", detail: "University of Wrocław, Faculty of Physics & Astronomy. Thesis: Strong correlations in open quantum systems (Grade: 5.0/5.0). Supervised by Prof. Piotr Ługiewicz." },
        { year: "2017 – 2019", category: "Research", title: "Research Assistant", detail: "NuWro Monte Carlo neutrino event generator development supervised by Prof. Jan Sobczyk, resulting in a Physical Review C paper." },
        { year: "2015 – 2018", category: "Education", title: "B.Sc. in Physics", detail: "University of Wrocław. Thesis on MINERvA experiment data using NuWro Monte Carlo generator (Grade: 5.0/5.0)." }
      ]
    },
    {
      id: "krakow",
      name: "Kraków",
      country: "Poland",
      region: "europe",
      coords: [19.9450, 50.0647],
      dx: 8,
      dy: 4,
      anchor: "start",
      role: "Workshop Participant",
      years: "2024",
      events: [
        { year: "06/2024", category: "Workshop", title: "Quantum Optics and Information Workshop", detail: "Jagiellonian University. Focus on continuous-variable systems and quantum technologies." }
      ]
    },
    {
      id: "vienna",
      name: "Vienna",
      country: "Austria",
      region: "europe",
      coords: [16.3738, 48.2082],
      dx: -8,
      dy: 4,
      anchor: "end",
      role: "Research Visit (IQOQI)",
      years: "2024",
      events: [
        { year: "11/2024 – 12/2024", category: "Research", title: "IQOQI Research Visit", detail: "Institute for Quantum Optics and Quantum Information (Austrian Academy of Sciences). Worked on high-dimensional quantum states in optical circuits with the group of Prof. Rupert Ursin." }
      ]
    },
    {
      id: "frascati",
      name: "Frascati (Rome)",
      country: "Italy",
      region: "europe",
      coords: [12.6787, 41.8080],
      dx: 8,
      dy: -2,
      anchor: "start",
      role: "Seasonal School (INFN-LNF)",
      years: "2023",
      events: [
        { year: "05/2023", category: "School", title: "Spring School in Nuclear, Subnuclear & Astroparticle Physics", detail: "INFN Laboratori Nazionali di Frascati. Intensive training on quantum technologies in detector physics." }
      ]
    },
    {
      id: "trento",
      name: "Trento",
      country: "Italy",
      region: "europe",
      coords: [11.1211, 46.0679],
      dx: -8,
      dy: -6,
      anchor: "end",
      role: "Research Visit",
      years: "2023",
      events: [
        { year: "03/2023", category: "Research", title: "University of Trento Visit", detail: "Department of Physics, Quantum Science and Technology in Trento (Q@TN). Collaborated on integrated photonic circuits for quantum simulation." }
      ]
    },
    {
      id: "naples",
      name: "Naples",
      country: "Italy",
      region: "europe",
      coords: [14.2681, 40.8518],
      dx: 8,
      dy: 12,
      anchor: "start",
      role: "Conference Presenter",
      years: "2022",
      events: [
        { year: "09/2022", category: "Conference", title: "Quantum 2022: Workshop on Advances in Foundations of Quantum Mechanics", detail: "Poster & Discussion: Open quantum systems and memory effects in quantum walks." }
      ]
    },
    {
      id: "grenoble",
      name: "Grenoble",
      country: "France",
      region: "europe",
      coords: [5.7245, 45.1885],
      dx: -8,
      dy: -4,
      anchor: "end",
      role: "Seasonal School (Les Houches)",
      years: "2022",
      events: [
        { year: "04/2022", category: "School", title: "Les Houches Doctoral Training Session", detail: "Advanced spring session in the French Alps on quantum information processing and reservoir computing architectures." }
      ]
    },
    {
      id: "porquerolles",
      name: "Porquerolles",
      country: "France",
      region: "europe",
      coords: [6.2045, 43.0004],
      dx: -8,
      dy: 12,
      anchor: "end",
      role: "Seasonal School",
      years: "2022",
      events: [
        { year: "07/2022", category: "School", title: "Esquisses Summer School", detail: "Summer school in Îles d’Hyères on quantum algorithms and simulation." }
      ]
    },
    {
      id: "san_sebastian",
      name: "San Sebastian",
      country: "Spain",
      region: "europe",
      coords: [-1.9812, 43.3183],
      dx: -8,
      dy: 4,
      anchor: "end",
      role: "Conference Presenter",
      years: "2024",
      events: [
        { year: "05/2024", category: "Conference", title: "QUANTUMatter 2024", detail: "Poster: Time series processing with quantum memristor." }
      ]
    },
    {
      id: "groningen",
      name: "Groningen",
      country: "The Netherlands",
      region: "europe",
      coords: [6.5665, 53.2194],
      dx: -8,
      dy: -6,
      anchor: "end",
      role: "Erasmus Exchange Student",
      years: "2019",
      events: [
        { year: "02/2019 – 07/2019", category: "Education", title: "Erasmus Programme", detail: "University of Groningen. One semester studying theoretical physics abroad." }
      ]
    },
    {
      id: "sinaia",
      name: "Sinaia",
      country: "Romania",
      region: "europe",
      coords: [25.5513, 45.3524],
      dx: 8,
      dy: 4,
      anchor: "start",
      role: "Seasonal School",
      years: "2019",
      events: [
        { year: "09/2019", category: "School", title: "VIII Pontecorvo Neutrino Physics School", detail: "International school on neutrino physics in the Carpathian Mountains." }
      ]
    },
    {
      id: "tokai",
      name: "Tokai",
      country: "Japan",
      region: "japan",
      coords: [140.5694, 36.4674],
      dx: 10,
      dy: 4,
      anchor: "start",
      role: "Collaboration Talks (J-PARC)",
      years: "2018 – 2019",
      events: [
        { year: "04/2019", category: "Talk", title: "T2K Collaboration Meeting (Spring 2019)", detail: "Talk: Data-driven adjustments of the spectral function model in NuWro at J-PARC." },
        { year: "12/2018", category: "Talk", title: "T2K Collaboration Meeting (Winter 2018)", detail: "Talk: Investigating data discrepancies in NuWro with the spectral function model at J-PARC." }
      ]
    },
    {
      id: "okinawa",
      name: "Okinawa",
      country: "Japan",
      region: "japan",
      coords: [127.8460, 26.4950],
      dx: 10,
      dy: 4,
      anchor: "start",
      role: "Visiting Researcher",
      years: "2026",
      events: [
        { year: "06/2026 – 07/2026", category: "Research", title: "OIST Visiting Researcher", detail: "Okinawa Institute of Science and Technology. Collaborated with Bill Munro on photonic quantum architectures for time-series forecasting." }
      ]
    },
    {
      id: "singapore",
      name: "Singapore",
      country: "Singapore",
      region: "singapore",
      coords: [103.8198, 1.3521],
      dx: 10,
      dy: 4,
      anchor: "start",
      role: "Conference Presenter",
      years: "2025",
      events: [
        { year: "11/2025", category: "Conference", title: "QTML 2025 (Quantum Techniques in Machine Learning)", detail: "Poster: Quantum reservoir computing with multiple photonic memristors at Center for Quantum Technologies (CQT)." }
      ]
    }
  ];

  const visitedCountries = new Set([
    "Poland", "Austria", "Italy", "France", "Spain", "Netherlands", "Romania", "Japan", "Singapore"
  ]);

  // DOM elements
  const svg = d3.select("#research-map-svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const tooltip = d3.select("#map-tooltip");
  const detailPanel = d3.select("#city-detail-panel");
  const placesGrid = d3.select("#places-grid");

  // Eckert IV Projection centered on Eurasia (rotate longitudes by -67°)
  const projection = (typeof d3.geoEckert4 === "function" ? d3.geoEckert4() : d3.geoEqualEarth())
    .rotate([-67, 0]);

  // Fit view bounds to Europe, Japan, and Singapore with generous surrounding margin
  const boundsFeature = {
    type: "FeatureCollection",
    features: [
      { type: "Feature", geometry: { type: "Point", coordinates: [-22, 56] } }, // NW Atlantic margin
      { type: "Feature", geometry: { type: "Point", coordinates: [146, 38] } }, // E Japan
      { type: "Feature", geometry: { type: "Point", coordinates: [100, -2] } }  // S Singapore
    ]
  };

  projection.fitExtent([[45, 35], [width - 45, height - 35]], boundsFeature);

  const path = d3.geoPath().projection(projection);

  // Group structure: gMarkers is placed INSIDE gMap so markers and contours are
  // transformed simultaneously by the GPU compositor with ZERO lag.
  const gMap = svg.append("g").attr("class", "map-zoom-group");
  const gLand = gMap.append("g").attr("class", "layer-land");
  const gMarkers = gMap.append("g").attr("class", "layer-markers");

  // Zoom behavior: smoothly transforms gMap (moving land and markers together)
  let lastK = 1;
  const zoom = d3.zoom()
    .scaleExtent([0.85, 6])
    .on("zoom", (event) => {
      gMap.attr("transform", event.transform);
      if (event.transform.k !== lastK) {
        lastK = event.transform.k;
        const s = 1 / lastK;
        gMarkers.selectAll(".marker-inner").attr("transform", `scale(${s})`);
      }
    });

  svg.call(zoom);

  // Double-click resets view smoothly
  svg.on("dblclick.zoom", null);
  svg.on("dblclick", () => {
    svg.transition().duration(650).call(zoom.transform, d3.zoomIdentity);
  });

  let activePlaceId = "warsaw";

  function initMap(geojson) {
    if (!geojson || !geojson.features) {
      console.error("Invalid GeoJSON data provided");
      return;
    }

    // Render Landmass Contours
    gLand.selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("class", d => {
        const isVisited = visitedCountries.has(d.properties.name);
        return isVisited ? "map-land visited" : "map-land";
      })
      .attr("d", path)
      .append("title")
      .text(d => d.properties.name);

    // Render City Markers (directly placed at their projected coordinates inside gMap)
    const markerGroups = gMarkers.selectAll("g")
      .data(places)
      .enter()
      .append("g")
      .attr("class", d => d.id === activePlaceId ? "city-marker active" : "city-marker")
      .attr("id", d => `marker-${d.id}`)
      .attr("transform", d => {
        const pt = projection(d.coords);
        return `translate(${pt[0]}, ${pt[1]})`;
      })
      .on("mouseenter", (event, d) => {
        showTooltip(event, d);
        highlightMarker(d.id, true);
      })
      .on("mousemove", (event) => {
        positionTooltip(event);
      })
      .on("mouseleave", () => {
        hideTooltip();
        highlightMarker(null, false);
      })
      .on("click", (event, d) => {
        selectPlace(d);
        focusPlace(d);
      });

    // Inner marker wrapper that scales down gracefully when zooming in
    const markerInners = markerGroups.append("g")
      .attr("class", "marker-inner");

    // Halo pulse ring
    markerInners.append("circle")
      .attr("class", "marker-halo")
      .attr("r", 8);

    // Core dot
    markerInners.append("circle")
      .attr("class", "marker-dot")
      .attr("r", 5);

    // Bold, high-contrast city name label
    markerInners.append("text")
      .attr("class", "marker-label")
      .attr("dx", d => d.dx)
      .attr("dy", d => d.dy)
      .attr("text-anchor", d => d.anchor || "start")
      .text(d => d.name);

    // Populate places directory grid
    renderPlacesDirectory();

    // Render initial active place detail
    renderDetailPanel(places[0]);
  }

  // Smoothly center and focus on a clicked city
  function focusPlace(place) {
    const pt = projection(place.coords);
    const scale = 3.2;
    const targetTransform = d3.zoomIdentity
      .translate(width / 2 - scale * pt[0], height / 2 - scale * pt[1])
      .scale(scale);

    svg.transition()
      .duration(700)
      .call(zoom.transform, targetTransform);
  }

  // Tooltip Functions
  function showTooltip(event, d) {
    tooltip.html(`
      <h4>${d.name}, ${d.country}</h4>
      <p><strong>${d.years}</strong></p>
      <p>${d.role}</p>
      <p style="margin-top: 4px; font-size: 0.8em; color: var(--accent-amber);">Click to focus</p>
    `);
    tooltip.style("opacity", 1);
    positionTooltip(event);
  }

  function positionTooltip(event) {
    const wrapper = document.querySelector(".map-viewport-wrapper");
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = event.clientX - rect.left + 15;
    const y = event.clientY - rect.top + 15;
    tooltip.style("left", `${Math.min(x, rect.width - 260)}px`);
    tooltip.style("top", `${Math.min(y, rect.height - 120)}px`);
  }

  function hideTooltip() {
    tooltip.style("opacity", 0);
  }

  function highlightMarker(placeId, highlight) {
    gMarkers.selectAll(".city-marker").classed("active", d => d.id === placeId || d.id === activePlaceId);
  }

  function selectPlace(place) {
    activePlaceId = place.id;
    gMarkers.selectAll(".city-marker").classed("active", d => d.id === place.id);
    d3.selectAll(".place-card").classed("active", d => d.id === place.id);
    renderDetailPanel(place);
  }

  // Detail Panel
  function renderDetailPanel(place) {
    let eventsHtml = place.events.map(ev => `
      <li class="city-event-item">
        <span class="city-event-category">${ev.category}</span>
        <strong>${ev.title}</strong> (${ev.year})
        <div style="margin-top: 3px; color: var(--text-color);">${ev.detail}</div>
      </li>
    `).join("");

    detailPanel.html(`
      <div class="city-detail-header">
        <span class="city-detail-title">${place.name}, ${place.country}</span>
        <span class="city-detail-years">${place.years}</span>
      </div>
      <div class="city-detail-role">${place.role}</div>
      <ul class="city-events-list">
        ${eventsHtml}
      </ul>
    `);
  }

  // Directory Grid
  function renderPlacesDirectory() {
    const cards = placesGrid.selectAll(".place-card")
      .data(places)
      .enter()
      .append("div")
      .attr("class", d => d.id === activePlaceId ? "place-card active" : "place-card")
      .attr("id", d => `card-${d.id}`)
      .on("click", (event, d) => {
        selectPlace(d);
        focusPlace(d);
      })
      .on("mouseenter", (event, d) => {
        highlightMarker(d.id, true);
      })
      .on("mouseleave", () => {
        highlightMarker(null, false);
      });

    cards.html(d => `
      <div class="place-card-name">
        <span>${d.name}</span>
        <span style="font-size: 0.8em; color: var(--accent-amber); font-weight: normal;">${d.years}</span>
      </div>
      <div class="place-card-country">${d.country}</div>
      <div class="place-card-summary">${d.role}</div>
    `);
  }

  function startMap() {
    if (typeof d3 === "undefined") {
      console.error("D3 library not loaded");
      return;
    }

    if (typeof window !== "undefined" && window.RESEARCH_MAP_GEOJSON) {
      initMap(window.RESEARCH_MAP_GEOJSON);
    } else {
      const geojsonPath = window.location.pathname.includes('/data_analysis/') || window.location.pathname.includes('/algebra/')
        ? '../other/research_map.geojson'
        : 'other/research_map.geojson';

      d3.json(geojsonPath).then(geojson => {
        initMap(geojson);
      }).catch(err => {
        console.error("Error loading research map geojson:", err);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startMap);
  } else {
    startMap();
  }
})();
