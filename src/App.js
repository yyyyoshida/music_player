import Header from './components/Header';
import Main from './components/Main';
import { useState } from 'react';

function App() {
  return (
    <>
      <Header />
      <Main />
    </>
  );
}

export default App;

// 再生バーの無駄な再レンダリングを防ぐ
