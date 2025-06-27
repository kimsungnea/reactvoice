import React, { useState, useEffect } from 'react';

const Search = ({ onSearch, defaultKeyword = '' }) => {
  const [input, setInput] = useState(defaultKeyword);

  useEffect(() => {
    if (defaultKeyword) {
      onSearch(defaultKeyword);
    }
  }, [defaultKeyword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="장소를 입력하세요"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit">검색</button>
    </form>
  );
};

export default Search;
