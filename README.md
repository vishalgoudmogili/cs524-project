# Leveraging Light Pollution and Streetlight Outage Data for Crime Vulnerability Analysis on Chicago Streets


## Overview 📄

This project investigates the relationship between lighting conditions—such as light pollution and streetlight outages—and nighttime crime in Chicago. By integrating crime data, VIIRS satellite-based light pollution data, and streetlight outage records, we developed metrics like the Light Pollution Index (LPI) and the Light Vulnerability Index (LVI). These metrics were visualized using an interactive web-based tool built with React, Leaflet.js, and D3.js.

The system enables spatial and temporal analysis of crime patterns, empowering policymakers and urban planners to optimize streetlight repairs and reduce vulnerability in high-risk areas.

---

## Data Sources 📊 

The analysis was based on three datasets:

1. **Crime Data**: Sourced from the [Crimes - 2001 to Present - Chicago Data Portal]([https://data.cityofchicago.org/](https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-Present/ijzp-q8t2/about_data)) this dataset includes attributes such as crime type, date, location, and street names.
2. **VIIRS Nighttime Light Pollution Data**: Monthly satellite radiance data from [NOAA](https://www.ngdc.noaa.gov/eog/viirs/) to measure artificial lighting intensity across Chicago.
3. **Streetlight Outage Data**: 311 service request logs for streetlight outages, also from the [311 Service Requests - Street Lights All Out]([https://data.cityofchicago.org/](https://www.chicago.gov/city/en/dataset/street_lights_out.html)).

---

## Problem Statement 🧠 

### A High-Level Description of the Problem and Its Importance

In urban environments, lighting plays a critical role in ensuring public safety during nighttime hours. Conventional thinking often associates well-lit areas with reduced crime rates, while dimly lit or dark areas are perceived as high-risk zones for criminal activities. However, this binary perception fails to account for the nuanced interplay between lighting conditions and crime patterns. 

Emerging research suggests that excessive lighting, known as light pollution, can create shadows and glare that obscure visibility and facilitate certain crimes, while streetlight outages can leave areas vulnerable by plunging them into darkness. These dynamics highlight the need for a comprehensive analysis of lighting-related vulnerabilities to address safety concerns effectively.

Chicago, a bustling metropolitan city, experiences significant nighttime crime, making it an ideal case study for exploring the relationship between lighting and crime. Despite advancements in urban lighting infrastructure, frequent streetlight outages and fluctuating light pollution levels exacerbate safety risks in certain areas. This project aims to bridge the gap by analyzing the combined effects of light pollution and streetlight outages on crime.

The insights derived from this analysis are crucial for urban planners, policymakers, and public safety officials. By identifying high-risk streets and times, they can prioritize interventions such as streetlight repairs, optimize lighting designs, and develop adaptive urban safety strategies. Ultimately, this project seeks to contribute to safer urban environments through data-driven decision-making.

---

## Research Challenges 🤔 

- **Geospatial Data Integration:**: Mapping crimes and outages to street-level data required precise spatial joins and handling inconsistencies in street names.
- **Temporal Analysis**: Aligning monthly light pollution data with individual crimes was complex, requiring careful handling of overlapping dates.
- **Dynamic Interactivity**: Implementing real-time updates for metrics like LVI in response to user-configured parameters was a challenge in both backend and frontend design.

---

## System Implementation 🖥️ 

### Data Preprocessing

Data preprocessing involved cleaning, transformation, and integration of datasets:

1. **Cleaning and Filtering**:
   - Removed duplicate and incomplete records.
   - Focused on nighttime crimes (6 PM to 6 AM) for relevance.
   - Standardized street names for mapping consistency.

2. **Mapping Light Pollution Data**:
   - Mapped crime incidents to their corresponding light pollution values (current, previous, and next month).
   - Calculated the **Light Pollution Index (LPI)** for each crime to assess unusual light fluctuations.

3. **Integrating Streetlight Outages**:
   - Mapped crimes to streetlight outage locations.
   - Added a binary indicator (1 for outage, 0 for no outage) to denote outage presence during a crime.

4. **Street-Level Aggregation**:
   - Aggregated LPI and streetlight outage metrics by street.
   - Computed the **Light Vulnerability Index (LVI)** using the formula:
     \[
     \text{LVI} = \alpha \times \text{Mean LPI} + \beta \times \text{Mean Streetlight Outage}
     \]
     where \(\alpha\) and \(\beta\) are user-defined weights.

---

### Backend Development

The backend, built with Flask, served as the bridge between the processed data and the interactive frontend. Two main API endpoints were implemented:

1. **Street-Level Data Endpoint**:
   - Path: `/api/streets`
   - Response: GeoJSON containing LVI, LPI, streetlight outages, and crime metrics.

2. **Boundary Data Endpoint**:
   - Path: `/api/boundaries`
   - Response: GeoJSON of Chicago's boundaries for contextual mapping.

The backend dynamically recalculated LVI values based on user-defined weights, enabling real-time updates to the visualizations.

---

### Frontend Development

The frontend was developed using **React**, **Leaflet.js**, and **D3.js** to deliver an intuitive, interactive user experience. The interface included four key visualizations:


<img width="1512" alt="ui" src="https://github.com/user-attachments/assets/1884a944-3f77-4072-a01b-e81e58bdc54b" />


#### 1. Interactive Choropleth Map (Fig. 1)

The map visualizes LVI across Chicago streets, with streets color-coded from green (low vulnerability) to red (high vulnerability). Users can click on streets to view detailed metrics like frequent crime types and peak crime hours. Real-time updates reflect weight adjustments for LPI and outages.

#### 2. Scatter Plot (Fig. 2)

The scatter plot allows users to compare streets based on LVI, LPI, or streetlight outages. Outliers, such as streets with disproportionately high LPI, can be identified for targeted interventions.

#### 3. Heatmap (Fig. 3)

The heatmap highlights temporal crime patterns by showing crime frequency for each street across different hours. This visualization aids in identifying critical times for safety interventions.

#### 4. Line Chart (Fig. 4)

The line chart visualizes monthly crime trends for selected streets, providing insights into seasonal crime patterns and the impact of lighting conditions.

---


## Instructions to Run 📜 

### Prerequisites

- **Node.js**: [Install Node.js](https://nodejs.org/)
- **Python 3.8+**: Version 3.8 or higher.
- **Required Python Libraries**:
  ```bash
  pip install pandas geopandas flask flask-cors
  ```

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/lvi-analysis.git
   cd lvi-analysis
   ```

2. **Run Backend**: Navigate to the backend folder and start the Flask server:
   ```bash
   cd backend
   python flask-server.py
   ```
3. **Run Frontend**: Navigate to the frontend folder, install dependencies, and start the React app:
   ```bash
   cd frontend
   npm install
   npm start
   ```
4. **Access the App**: Open your browser and go to [http://localhost:3000](http://localhost:3000) to access the frontend app and backend at [http://127.0.0.1:5000/](http://127.0.0.1:5000/).


---

## Results and Figures 🖼️ 

### Choropleth Map (Fig. 1)

<img width="581" alt="choropleth" src="https://github.com/user-attachments/assets/3be929b3-5a93-46f5-941d-99f5de0478b8" />

The choropleth map provides a comprehensive view of street-level vulnerabilities. Streets with high LVI are displayed in red, while low-LVI streets are green. Interactive features, such as popups, provide additional insights into crime statistics for each street.

### Scatter Plot (Fig. 2)

<img width="902" alt="scatter-plot" src="https://github.com/user-attachments/assets/bc441ee0-950d-4b0c-8526-b526cd18b0c2" />

The scatter plot enables comparative analysis of streets, helping identify correlations between high LPI values and increased vulnerability.

### Heatmap (Fig. 3)

<img width="410" alt="heat-map" src="https://github.com/user-attachments/assets/5fa63d18-5a49-43f6-978b-229aae89e09b" />

The heatmap visualizes when crimes are most likely to occur on specific streets, highlighting late-night hours as high-risk periods.

### Line Chart (Fig. 4)

<img width="397" alt="line-chart" src="https://github.com/user-attachments/assets/65567f16-7fda-4ba8-92a7-c3bf6373e9cd" />

The line chart captures monthly crime fluctuations, revealing seasonal trends and potential periods of increased risk.

---


## Findings 🧠 
- Streets with frequent outages and high LPI exhibit higher crime vulnerability.
- Crime patterns vary by hour, with specific streets showing spikes in late-night hours.
- Seasonal trends in crime are evident, aligning with fluctuations in lighting conditions.


---

## Future Work 🚀

1. **Granular Data**: Extend analysis to individual neighborhoods and integrate additional variables like pedestrian activity.
2. **Temporal Analysis**: Study long-term trends and seasonal variations.
3. **Cross-City Comparison**: Apply the LVI framework to other cities to validate and refine the methodology.

---

## References 📚
1. City of Chicago. Crime Data Portal. Available at: [Crime Data](https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-Present/ijzp-q8t2/about_data).
2. NOAA VIIRS Nighttime Lights. Available at: [VIIRS Nighttime Satellite Data](https://www.ngdc.noaa.gov/eog/viirs).
3. City of Chicago. 311 Service Requests for Streetlight Outages. Available at: [311 Service Requests](https://data.cityofchicago.org).
4. Chicago Alley Lighting Project (2000). Available at: [Chicago Alley Lighting Project](https://www.csu.edu/cerc/researchreports/documents/ChicagoAlleyLightingProject2000_000.pdf).
