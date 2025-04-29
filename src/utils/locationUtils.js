// Calculate distance between two points using Haversine formula
export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Campus coordinates
  export const CAMPUS_COORDINATES = {
    latitude: 30.7690,
    longitude: 76.5785,
    radius: 0.2 // 200 meters in kilometers
  };
  
  // Check if location is within campus
  export const isWithinCampus = (latitude, longitude) => {
    const distance = getDistanceFromLatLonInKm(
      latitude,
      longitude,
      CAMPUS_COORDINATES.latitude,
      CAMPUS_COORDINATES.longitude
    );
    return distance <= CAMPUS_COORDINATES.radius;
  };