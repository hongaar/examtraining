import "@picocss/pico/css/pico.jade.min.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components";
import { ExamProvider, FirebaseProvider } from "./context";
import "./index.scss";
import { Error } from "./pages";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={<Error />}>
      <FirebaseProvider>
        <ExamProvider>
          <App />
        </ExamProvider>
      </FirebaseProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.debug);
