// Using OpenRouteService API as an example
// You'll need to sign up for an API key at https://openrouteservice.org/

const API_KEY = 'your_openrouteservice_api_key'; // Replace with your actual API key
const BASE_URL = 'https://api.openrouteservice.org/v2';

// Mock data for testing without API key
const MOCK_DESTINATIONS = [
  { name: "New York City", address: "New York, NY, USA", coordinates: [-73.9857, 40.7484] },
  { name: "Los Angeles", address: "Los Angeles, CA, USA", coordinates: [-118.2437, 34.0522] },
  { name: "Chicago", address: "Chicago, IL, USA", coordinates: [-87.6298, 41.8781] },
  { name: "Houston", address: "Houston, TX, USA", coordinates: [-95.3698, 29.7604] },
  { name: "Phoenix", address: "Phoenix, AZ, USA", coordinates: [-112.0740, 33.4484] },
  { name: "Philadelphia", address: "Philadelphia, PA, USA", coordinates: [-75.1652, 39.9526] },
  { name: "San Antonio", address: "San Antonio, TX, USA", coordinates: [-98.4936, 29.4241] },
  { name: "San Diego", address: "San Diego, CA, USA", coordinates: [-117.1611, 32.7157] },
  { name: "Dallas", address: "Dallas, TX, USA", coordinates: [-96.7970, 32.7767] },
  { name: "San Jose", address: "San Jose, CA, USA", coordinates: [-121.8863, 37.3382] }
];

// Helper function to calculate distance between two points (in km)
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to generate mock route coordinates between two points
function generateRouteCoordinates(start, end, numPoints = 10) {
  const coords = [];
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const lat = start[1] + fraction * (end[1] - start[1]);
    const lng = start[0] + fraction * (end[0] - start[0]);
    coords.push([lat, lng]);
  }
  return coords;
}

export async function getRouteDetails(destinations) {
  if (destinations.length < 2) {
    throw new Error('At least two destinations are required to calculate a route');
  }
  
  try {
    // If API key is not set or is the default value, use mock data
    if (!API_KEY || API_KEY === 'your_openrouteservice_api_key') {
      console.log('Using mock route data (no API key provided)');
      
      // Calculate mock route details
      let totalDistance = 0;
      let totalDuration = 0;
      let allCoordinates = [];
      
      for (let i = 0; i < destinations.length - 1; i++) {
        const start = destinations[i].coordinates;
        const end = destinations[i + 1].coordinates;
        
        // Calculate direct distance
        const distance = calculateDistance(start, end);
        totalDistance += distance;
        
        // Estimate duration (assuming 60 km/h average speed)
        const duration = distance / 60 * 60; // Convert to minutes
        totalDuration += duration;
        
        // Generate route coordinates
        const routeCoords = generateRouteCoordinates(start, end);
        allCoordinates = [...allCoordinates, ...routeCoords];
      }
      
      return {
        distance: totalDistance,
        duration: totalDuration,
        coordinates: allCoordinates
      };
    }
    
    // Real API call if API key is provided
    const coordinates = destinations.map(dest => dest.coordinates);
    
    const response = await fetch(`${BASE_URL}/directions/driving-car`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: coordinates,
        format: 'geojson'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch route details');
    }
    
    const data = await response.json();
    
    // Extract route details
    const route = data.features[0];
    const distance = route.properties.summary.distance / 1000; // Convert to km
    const duration = route.properties.summary.duration / 60; // Convert to minutes
    const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
    
    return {
      distance,
      duration,
      coordinates: routeCoordinates
    };
  } catch (error) {
    console.error('Error fetching route details:', error);
    throw error;
  }
}

export async function searchLocation(query) {
  try {
    // If API key is not set or is the default value, use mock data
    if (!API_KEY || API_KEY === 'your_openrouteservice_api_key') {
      console.log('Using mock search data (no API key provided)');
      
      // Filter mock destinations based on query
      const results = MOCK_DESTINATIONS.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.address.toLowerCase().includes(query.toLowerCase())
      );
      
      return results;
    }
    
    // Real API call if API key is provided
    const response = await fetch(`${BASE_URL}/geocode/search?text=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to search location');
    }
    
    const data = await response.json();
    
    return data.features.map(feature => ({
      name: feature.properties.name,
      address: feature.properties.label,
      coordinates: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]]
    }));
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
}
