import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';
import routes from '~react-pages';

function App() {
  return (
    <div className="w-full m-0 dark:bg-primary-800 root">
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <CircularProgress />
          </div>
        }
      >
        {useRoutes(routes)}
      </Suspense>
    </div>
  );
}

export default App;
