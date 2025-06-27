// src/Pages/Map/MapPage.js
import React, { useRef, useState, useEffect } from 'react';
import KakaoMap from '../../Components/KakaoMap';
import Search from '../../Components/Search';
import SearchResults from '../../Components/SearchResults';
import NearbyHospitals from '../../Components/NearbyHospitals';

import { useLocation } from 'react-router-dom';             // ✅ URL 파라미터 추출
import queryString from 'query-string';           

const MapPage = () => {
  const mapRef = useRef(null);
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState([]);

  const location = useLocation();
  const { autoSearch } = queryString.parse(location.search); // ✅ URL 파라미터 추출

  useEffect(() => {
    if (autoSearch) {
      setKeyword(autoSearch); // ✅ 진료과 자동 검색
    }
  }, [autoSearch]);

  const handleSearch = (term) => {
    setKeyword(term);
  };

  const handlePlacesUpdate = (results) => {
    setPlaces(results);
  };

  return (
<div>
  <h2>병원 검색</h2>
  <Search onSearch={handleSearch} defaultKeyword={keyword} />
  <KakaoMap keyword={keyword} mapRef={mapRef} onPlacesUpdate={handlePlacesUpdate} />
  <NearbyHospitals mapRef={mapRef} onPlacesUpdate={handlePlacesUpdate} keyword={keyword} />
  {/* <SearchResults places={places} /> */}
</div>
  );
};


export default MapPage;
