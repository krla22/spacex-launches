# Kurt's SpaceX Launch Viewer

This assessment React website was built with React, Axios, and Tailwind.

## Features

- View SpaceX launches with detailed information such as mission name, year, and status.
- Search for launches by mission name.
- Sort launches by year (Oldest to Newest or Newest to Oldest).
- Filter launches by status (Success, Failure, or Upcoming).
- Dynamic infinite-scrolling backgrounds fetched from NASA's APOD API.

## APIs Used

### SpaceX API
- **Endpoint**: `https://api.spacexdata.com/v3/launches`
- Provides details about all SpaceX launches.
- The data includes:
  - Mission name
  - Launch year
  - Launch success status
  - Details about the mission
  - Links to related articles and videos

### NASA APOD API
- **Endpoint**: `https://api.nasa.gov/planetary/apod`
- Provides the Astronomy Picture of the Day images.
- The images are used to create an infinite-scrolling background to follow the SpaceX content.
