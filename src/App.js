import Header from './components/Header';
import Main from './components/Main';
import { useState } from 'react';
import Login from './components/Login';

function App() {
  return (
    <>
      <Header />
      <Login />
      <Main />
    </>
  );
}

export default App;

// 再生バーの無駄な再レンダリングを防ぐ
