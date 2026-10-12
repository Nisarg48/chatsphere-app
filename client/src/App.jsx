import { BrowserRouter } from 'react-router-dom';
import AppRoute from './AppRoute';
import { DarkModeProvider } from './contexts/DarkModeContext';

function App() {
  return (
    <DarkModeProvider>
      <BrowserRouter>
        <AppRoute />
      </BrowserRouter>
    </DarkModeProvider>
  )
}

export default App