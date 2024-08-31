import React, { useState } from 'react';
import axios from 'axios';

interface SearchBarProps {
  setSearchResults: (events: Event[]) => void;
}

interface Event {
  id: number;
  name: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ setSearchResults }) => {
  const [query, setQuery] = useState<string>('');

  const handleSearch = async () => {
    try {
      const response = await axios.get<Event[]>(`${import.meta.env.VITE_APP_URL}/events/search`, {
        params: { q: query },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching events:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search events"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchBar;
