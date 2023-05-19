import React from 'react';
// import logo from './logo.svg';
import './App.scss';

import type { FC } from 'react';
import { Button, ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';

const App: FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm
        // token: { colorPrimary: '#00b96b' }
      }}
    >
      <Button type="primary">Button</Button>

      <a
        className="App-link"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </ConfigProvider>
  )
};

export default App;
