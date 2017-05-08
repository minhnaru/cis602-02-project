# Project Visualization

## Dataset

Natality Information (Births)
The dataset “Natality” represents the birth counts of residents and non-residents based on the maternal risk factors of Tobacco Use happening within the United States regions. The number of given births are calculated from state, census regions, mother’s age, and mother’s risk factors such as tobacco use. All the data were collected from 2007 to 2015.

Source of dataset:
- Centers for Disease Control and Prevention (CDC).
- United States Department of Health and Human Services (US DHHS).
- National Center and Health Statistics (NCHS).
- Natality public-use data on CDC WONDER Online Database.

The dataset in the website CDC WONDER provides table, and data extracts according to the chosen Group results. When requesting the data, I can limit and index the data by any and all of the data variables. Follow is the description of types and semantic of datasets:

Header | Definition
---|---------
`Date/Time` | The date and time of the Uber pickup
`Lat` | The latitude of the Uber pickup
`Lon` | The longitude of the Uber pickup
`Base` | The [TLC base company](http://www.nyc.gov/html/tlc/html/industry/base_and_business.shtml) code affiliated with the Uber pickup

### Natality Data
The raw data is from 130MB to 200MB in zip files.
When unzip, the data is around 5GB. Here is the link to obtain the raw data:
https://www.cdc.gov/nchs/data_access/VitalStatsOnline.htm#Births%EF%BB%BF%EF%BB%BF%EF%BB%BF%EF%BB%BF%EF%BB%BF%EF%BB%BF%EF%BB%BF

### Median Income Data
The raw data (included in zip file) can be obtained from:
https://www.census.gov/data/tables/time-series/demo/income-poverty/historical-income-households.html

### Tobacco Use
The raw data (included in zip file) can be obtained from:
https://www.healthdata.gov/dataset/behavioral-risk-factor-data-tobacco-use-2011-present
This dataset is behavioral risk factor data represent tobacco use from 2011 to present. All information about leading causes of death are collected from CDC, State Tobacco Activities Tracking and Evaluation (STATE) system. BRFSS Survey Data. I extracted and filtered the data and get the current smoking status of female only from 2013 to 2015.

## References
