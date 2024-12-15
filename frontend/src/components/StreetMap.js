import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, Popup } from 'react-leaflet';
import * as d3 from 'd3';
import 'leaflet/dist/leaflet.css';
import './../App.css';

function StreetMap() {
  const [streetData, setStreetData] = useState(null);
  const [boundaryData, setBoundaryData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('LVI'); // Default metric for scatter plot

  const normalizeStreetName = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/streets')
      .then((response) => response.json())
      .then((data) => {
        const normalizedData = {
          ...data,
          features: data.features.map((feature) => {
            const updatedFeature = { ...feature };
            updatedFeature.properties.cleaned_block = normalizeStreetName(
              feature.properties.cleaned_block
            );
            return updatedFeature;
          }),
        };
        console.log('Normalized Street Data:', normalizedData);
        setStreetData(normalizedData);
      })
      .catch((error) => console.error('Error fetching street data:', error));
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/boundaries')
      .then((response) => response.json())
      .then((data) => {
        console.log('Boundary Data:', data);
        setBoundaryData(data);
      })
      .catch((error) => console.error('Error fetching boundary data:', error));
  }, []);

  useEffect(() => {
    if (streetData) {
      drawScatterPlot();
      drawHeatmap();
      drawLineChart();
    }
  }, [streetData, selectedMetric]);

  const drawScatterPlot = () => {
    const svg = d3.select('#scatterplot');
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    const filteredData = Array.from(
      d3.group(
        streetData.features.map((feature) => ({
          street: feature.properties.cleaned_block,
          value: feature.properties[selectedMetric],
        })),
        (d) => d.street
      ).values()
    ).map(([first]) => first);

    const xScale = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.street))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.value)])
      .range([height - margin.bottom, margin.top]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - (-30))
      .attr('text-anchor', 'middle')
      .text('Streets');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text(selectedMetric);

    svg
      .selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.street) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.value))
      .attr('r', 5)
      .attr('fill', 'blue');
  };

  const drawHeatmap = () => {
    const svg = d3.select('#heatmap');
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };

    const filteredData = Array.from(
      d3.group(
        streetData.features.map((feature) => ({
          street: feature.properties.cleaned_block,
          hour: +feature.properties.Frequent_Time,
        })),
        (d) => d.street
      ).values()
    ).map(([first]) => first);

    const xScale = d3
      .scaleBand()
      .domain(d3.range(24))
      .range([margin.left, width - margin.right])
      .padding(0.05);

    const yScale = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.street))
      .range([margin.top, height - margin.bottom])
      .padding(0.05);

    const colorScale = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, 23]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => `${d}`)); // Show only hour in numeric format

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('Hours (24-hour format)');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('Streets');

    svg
      .selectAll('rect')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.hour))
      .attr('y', (d) => yScale(d.street))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => colorScale(d.hour));
  };


  const drawLineChart = () => {
    const svg = d3.select('#linechart');
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    const filteredData = Array.from(
      d3.group(
        streetData.features.map((feature) => ({
          street: feature.properties.cleaned_block,
          value: feature.properties.Crime_Count,
        })),
        (d) => d.street
      ).values()
    ).map(([first]) => first);

    const xScale = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.street))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, (d) => d.value)])
      .range([height - margin.bottom, margin.top]);

    const line = d3
      .line()
      .x((d) => xScale(d.street) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.value));

    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - (-30))
      .attr('text-anchor', 'middle')
      .text('Streets');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('Crime Count');

    svg
      .append('path')
      .datum(filteredData)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2)
      .attr('d', line);
  };

  return (
    <div>
      <MapContainer center={[41.8781, -87.6298]} zoom={10} style={{ height: '450px', width: '44%', marginLeft: '30%', borderRadius: '10px', border: '2px solid black' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {boundaryData && <GeoJSON data={boundaryData} style={{ color: 'dark grey', weight: 2 }} />}
        {streetData &&
          streetData.features.map((feature, idx) => {
            const geometry = feature.geometry;
            const properties = feature.properties;

            if (geometry.type === 'MultiLineString') {
              return geometry.coordinates.map((coords, i) => (
                <Polyline
                  key={`${idx}-${i}`}
                  positions={coords.map(([lng, lat]) => [lat, lng])}
                  color={properties.LVI > 0.5 ? 'red' : 'green'}
                  weight={3}
                >
                  <Popup>
                    <strong>Street:</strong> {properties.cleaned_block}
                    <br />
                    <strong>LVI:</strong> {properties.LVI.toFixed(2)}
                    <br />
                    <strong>Top Crime:</strong> {properties.Top_Crime}
                    <br />
                    <strong>Crime Count:</strong> {properties.Crime_Count}
                  </Popup>
                </Polyline>
              ));
            }
            return null;
          })}
      </MapContainer>
      <div className="visualizations">
        <div class="scatter-plot margin-left-5">
          <h2 class="center-text">Scatter Plot</h2>
          <label htmlFor="metric-select">Select Metric:</label>
          <select
            id="metric-select"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="LVI">LVI</option>
            <option value="LPI">LPI</option>
            <option value="Street_Light_Outage">Street Light Outage</option>
          </select>
          <svg id="scatterplot" width="400" height="350"></svg>
        </div>
        <div class="margin-left-5">
          <h2 class="center-text">Heatmap</h2>
          <svg id="heatmap" width="400" height="300"></svg>
        </div>
        <div class="margin-left-5">
          <h2 class="center-text">Line Chart</h2>
          <svg id="linechart" width="400" height="350"></svg>
        </div>
      </div>
    </div>
  );
}

export default StreetMap;
