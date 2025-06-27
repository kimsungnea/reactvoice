import React from 'react';

const SearchResults = ({ places }) => {
  if (places.length === 0) return null;

  return (
    <ul style={{ marginTop: '20px' }}>
      {places.map((place, idx) => (
        <li key={idx} style={{ marginBottom: '10px' }}>
          <strong>{place.place_name}</strong><br />
          {place.address_name}
        </li>
      ))}
    </ul>
  );
};

export default SearchResults;
