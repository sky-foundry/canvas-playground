import { App } from './app.tsx';
import { createRoot } from 'react-dom/client';
import './index.css'

const root = createRoot(document.getElementById('app')!);
root.render(<App />);