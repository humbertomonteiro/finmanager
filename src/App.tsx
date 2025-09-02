import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./infrastructure/routes/RoutesApp";

export default function App() {
  return (
    <BrowserRouter>
      <RoutesApp />
    </BrowserRouter>
  );
}
