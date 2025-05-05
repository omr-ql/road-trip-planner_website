import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DestinationCard from '../components/DestinationCard';
import { useTripManager } from '../hooks/useTripManager';
import { searchLocation } from '../services/mapService';
export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    destinations, 
    addDestination, 
    reorderDestinations,
    loadSavedTrip,
    resetTrip
  } = useTripManager();
  
  useEffect(() => {
    loadSavedTrip();
  }, [loadSavedTrip]);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("Search button clicked with query:", searchQuery);
    
    if (!searchQuery.trim()) {
      setError('Please enter a destination to search');
      return;
    }
    
    setIsSearching(true);
    setError('');
    
    try {
      // Use a mock response for testing if API key isn't configured
      // Remove this in production and use only the real API call
      const mockResults = [
        {
          name: "New York City",
          address: "New York, NY, USA",
          coordinates: [-73.9857, 40.7484]
        },
        {
          name: "Los Angeles",
          address: "Los Angeles, CA, USA",
          coordinates: [-118.2437, 34.0522]
        },
        {
          name: "Chicago",
          address: "Chicago, IL, USA",
          coordinates: [-87.6298, 41.8781]
        }
      ];
      
      // Try the real API call first
      let results;
      try {
        results = await searchLocation(searchQuery);
        console.log("API search results:", results);
      } catch (apiError) {
        console.error("API search failed, using mock data:", apiError);
        // Fall back to mock data if API fails
        results = mockResults.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setError('No locations found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      setError('Failed to search for locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddDestination = (location) => {
    addDestination(location);
    setSearchResults([]);
    setSearchQuery('');
  };
  
  const moveDestination = (index, direction) => {
    const newOrder = [...destinations];
    const newIndex = index + direction;
    
    if (newIndex < 0 || newIndex >= destinations.length) return;
    
    // Swap positions
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    reorderDestinations(newOrder);
  };
  
  return (
    <div className="home-page">
      <h1>Road Trip Planner</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a destination..."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index} onClick={() => handleAddDestination(result)}>
                {result.name} - {result.address}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="destinations-list">
        <h2>Your Trip</h2>
        
        {destinations.length === 0 ? (
          <p>Start by searching for destinations to add to your trip.</p>
        ) : (
          <>
            {destinations.map((destination, index) => (
              <DestinationCard 
                key={destination.id}
                destination={destination}
                index={index}
                total={destinations.length}
                onMoveUp={() => moveDestination(index, -1)}
                onMoveDown={() => moveDestination(index, 1)}
              />
            ))}
            
            <div className="trip-actions">
              <button className="btn-reset" onClick={resetTrip}>
                Reset Trip
              </button>
              
              {destinations.length > 1 && (
                <Link to="/map" className="btn-view-map">
                  View on Map
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}