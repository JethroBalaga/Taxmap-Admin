import React, { useState, useEffect } from 'react';
import { IonSearchbar, IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { closeCircle } from 'ionicons/icons';

interface SearchProps<T> {
  data: T[];
  searchKeys: (keyof T)[];
  placeholder?: string;
  onSearch?: (filteredData: T[]) => void;
  onItemClick?: (item: T) => void;
  itemRenderer?: (item: T) => React.ReactNode;
  debounceTime?: number;
}

const Search = <T extends Record<string, any>>({
  data,
  searchKeys,
  placeholder = 'Search...',
  onSearch,
  onItemClick,
  itemRenderer,
  debounceTime = 300,
}: SearchProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() === '') {
        setFilteredData(data);
        onSearch?.(data);
      } else {
        const filtered = data.filter(item =>
          searchKeys.some(key =>
            String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
        setFilteredData(filtered);
        onSearch?.(filtered);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchTerm, data, debounceTime, searchKeys, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    setFilteredData(data);
    onSearch?.(data);
  };

  const defaultItemRenderer = (item: T) => (
    <IonItem button onClick={() => onItemClick?.(item)}>
      <IonLabel>
        {searchKeys.map(key => (
          <div key={String(key)}>{item[key]}</div>
        ))}
      </IonLabel>
    </IonItem>
  );

  return (
    <div className="search-component">
      <IonSearchbar
        value={searchTerm}
        placeholder={placeholder}
        onIonChange={e => setSearchTerm(e.detail.value || '')}
        onIonFocus={() => setIsFocused(true)}
        onIonBlur={() => setTimeout(() => setIsFocused(false), 200)}
        debounce={debounceTime}
      />
      
      {searchTerm && (
        <IonIcon
          icon={closeCircle}
          slot="end"
          className="clear-icon"
          onClick={handleClear}
        />
      )}

      {isFocused && filteredData.length > 0 && (
        <IonList className="search-results">
          {filteredData.map((item, index) => (
            <React.Fragment key={index}>
              {itemRenderer ? itemRenderer(item) : defaultItemRenderer(item)}
            </React.Fragment>
          ))}
        </IonList>
      )}
    </div>
  );
};

export default Search;