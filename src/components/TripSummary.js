import React from 'react';
import { useTripManager } from '../hooks/useTripManager';
import { formatDistance, formatDuration, estimateFuelCost } from '../utils/distanceCalc';

export default function TripSummary({ fuelEfficiency = 8, fuelPrice = 1.5 }) {
  const { totalDistance, totalDuration } = useTripManager();
  
  const fuelCost = estimateFuelCost(totalDistance, fuelEfficiency, fuelPrice);
  
  return (
    <div className="trip-summary">
      <h2>Trip Summary</h2>
      
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-label">Total Distance</span>
          <span className="stat-value">{formatDistance(totalDistance)}</span>
        </div>
        
        <div className="stat">
          <span className="stat-label">Driving Time</span>
          <span className="stat-value">{formatDuration(totalDuration)}</span>
        </div>
        
        <div className="stat">
          <span className="stat-label">Estimated Fuel Cost</span>
          <span className="stat-value">${fuelCost}</span>
        </div>
      </div>
    </div>
  );
}
