import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store/store.ts";
import { AuthInit } from "./components/AuthInit.tsx";
import { routers } from "./routes/index.tsx";
import { Toaster } from "./components/ui/feedback/Sonner.tsx";
import "./assets/styles/index.css";

// 🧩 Ẩn lỗi "Extension context invalidated" khi reload (do Chrome extension)
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Extension context invalidated')) {
        event.preventDefault(); // chặn log lỗi ra console
    }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthInit>
        <RouterProvider router={routers} />
      </AuthInit>
      <Toaster position="top-right" richColors />
    </Provider>
  </StrictMode>
);
