'use client';

import * as React from 'react';

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false);

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = window.matchMedia(query);
    setValue(result.matches); // Set initial value on client
    result.addEventListener('change', onChange);

    return () => result.removeEventListener('change', onChange);
  }, [query]);

  return value;
}
