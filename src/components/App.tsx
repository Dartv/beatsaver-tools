import React, { useEffect, useState } from 'react';

import Tools from './Tools';

const isBeatmapList = () => window.location.href.search(/browse|search/) !== -1;

const App: React.FC = () => {
  const [isMapList, setIsMapList] = useState(isBeatmapList());

  useEffect(() => {
    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, args: any) => {
        const res = target.apply(thisArg, args);

        setIsMapList(isBeatmapList());

        return res;
      },
    });
  }, []);

  return isMapList ? <Tools /> : null;
};

export default App;
