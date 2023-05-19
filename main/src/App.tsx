import React from 'react';
import logo from './logo.svg';
import './App.css';

import type { FC } from 'react';
import { Button } from 'antd';
import 'antd/dist/reset.css';

function App() {
  return (
    <div className="App">
      <Button type="primary">Button</Button>

      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </div>
  );
}

export default App;
