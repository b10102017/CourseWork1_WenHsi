import React from 'react'; //從 React 套件中匯入 React，React 是建立 UI 的核心 library。
import ReactDOM from 'react-dom/client'; // React → 產生畫面；ReactDOM → 把畫面放到瀏覽器。
import './index.css'; // 讀取我自己專案裡的 index.css 檔案。
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); //在 index.html 裡會有 <div id="root"></div>，是 React App 要插入的位置。
root.render( // 把 React App 畫到 root 裡面。
  <React.StrictMode>
    <App />
  </React.StrictMode>
);