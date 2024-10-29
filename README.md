# Positium Task Assignment C
### Task C: Creating a Web Widget for Indicator Comparison using ESRI ArcGIS JS SDK
### Sinoj Kokulasingam
sinoj.singam@gmail.com

Applying for the GIS Developer role at Positium

For this task assignment I chose to display economic indices for the Baltic countries. The user could select two countries of their choosing and compare the two indicators closely.

Datasets:
- For the GDP/capital data, I manually entered the data from IMF database into the geojson file and accessed it within the select function
- For the Residential Property Prices Index, I used the OECD API to access their extensive database on countries
- Countries geojson extracted from Natural Earth
- The country emojies were accessed through through restcountries API

Technologies used:
- ESRI ArcGIS JavaScript SDK: I purposefully used the SDK without an API credentials for later possible deployment onto my ePortfolio. Furthermore, the application could be run simply by double clicking on the index.html file
- Chart.JS was used for the pretty plots
- QGIS used for quick and dirty visualization and editing
- Visual Studio Code for weaving everything together
