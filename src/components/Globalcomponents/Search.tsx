import React, { forwardRef, useState, useEffect } from 'react';
import { IonSearchbar } from '@ionic/react';

interface SearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
}

const Search = forwardRef<HTMLIonSearchbarElement, SearchProps>(
  ({ onSearch, placeholder = 'Search...' }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      // Trigger search immediately when term changes
      onSearch(searchTerm);
    }, [searchTerm, onSearch]);

    return (
      <IonSearchbar
        ref={ref}
        value={searchTerm}
        placeholder={placeholder}
        onIonChange={e => setSearchTerm(e.detail.value || '')}
        debounce={0} // No delay
      />
    );
  }
);

export default Search;