import * as React from 'react';
// Routing 
import { Route ,Routes, Navigate} from "react-router-dom";

// Components 
import Main from './Components/Main';
import NavBar from './Components/Navbar';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path = "/" element={<Main />}/>
        <Route path = "*"     element={<Navigate to = "/" />}></Route>
      </Routes>
    </div>
  );
}

export default App;
