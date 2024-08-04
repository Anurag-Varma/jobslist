import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { extendTheme, ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

const styles = {
  global: {
    body: {
      color: 'black',
      bg: 'white',
    }
  }
};



const theme = extendTheme({ styles });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <App />
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>,
);
