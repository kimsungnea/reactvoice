// src/Pages/Map/MapPage.js
import React, { useRef, useState } from 'react';
import KakaoMap from '../../Components/KakaoMap';
import Search from '../../Components/Search';
import SearchResults from '../../Components/SearchResults';
import NearbyHospitals from '../../Components/NearbyHospitals';

const MapPage = () => {
  const mapRef = useRef(null);
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState([]);

  const handleSearch = (term) => {
    setKeyword(term);
  };

  const handlePlacesUpdate = (results) => {
    setPlaces(results);
  };

  return (
    <div>
      <h2>병원 검색</h2>
      <Search onSearch={handleSearch} />
      <KakaoMap keyword={keyword} mapRef={mapRef} onPlacesUpdate={handlePlacesUpdate} />
      
      {/* ✅ 검색어 없을 때만 자동 검색 */}
      {keyword === '' && <NearbyHospitals mapRef={mapRef} onPlacesUpdate={handlePlacesUpdate} />}

      <SearchResults places={places} />
    </div>
  );
};

export default MapPage;
