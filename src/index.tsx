import * as React from 'react';
import ReactDOM from 'react-dom';
import { Search } from './search';
import './index.css';

// const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <Search />
  </React.StrictMode>,
  document.getElementById('root')
);
