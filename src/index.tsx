import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

window.onload = () => {
  const root = document.createElement('div');

  root.setAttribute('id', 'bt-root');

  document.body.appendChild(root);

  ReactDOM.render(
    <App />,
    root,
  );
};
