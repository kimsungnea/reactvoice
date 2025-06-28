import React, { useRef, useState, useEffect } from 'react';
import KakaoMap from '../../Components/KakaoMap';
import NearbyHospitals from '../../Components/NearbyHospitals';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';

const MapPage = ({ recommendedHospitals, userLocation }) => {
  const mapRef = useRef(null);
  const [keyword, setKeyword] = useState('');
  const location = useLocation();
  const { autoSearch } = queryString.parse(location.search);

  useEffect(() => {
    if (autoSearch) {
      setKeyword(autoSearch);
    }
  }, [autoSearch]);

  const handleSearch = (term) => {
    setKeyword(term);
  };

  return (
    <div>
      <KakaoMap
        recommendedHospitals={recommendedHospitals}
        keyword={keyword}
        mapRef={mapRef}
        userLocation={userLocation}
      />
      <NearbyHospitals
        recommendedHospitals={recommendedHospitals}
        userLocation={userLocation}
        mapRef={mapRef}
      />
    </div>
  );
};

export default MapPage;
