import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { AllItems } from './pages/AllItems';
import { AddItem } from './pages/AddItem';
import { ReviewPage } from './pages/ReviewPage';
import { ItemDetail } from './pages/ItemDetail';
import { EditItem } from './pages/EditItem';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/items" element={<AllItems />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/items/:id/edit" element={<EditItem />} />
            <Route path="/add" element={<AddItem />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
