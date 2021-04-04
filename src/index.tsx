import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

window.onload = () => {
  const root = document.createElement('div');

  root.setAttribute('id', 'bt-root');
  root.setAttribute('class', 'navbar-item');

  const navbar = document.querySelector('.navbar .navbar-end');
  navbar?.prepend(root);

  ReactDOM.render(
    <App />,
    root,
  );
};
