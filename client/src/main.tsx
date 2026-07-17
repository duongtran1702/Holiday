import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./core/store/store/store.ts";
import { AuthInit } from "./features/auth/components/AuthInit.tsx";
import { routers } from "./core/routes/index.tsx";
import { Toaster } from "./core/components/ui/feedback/Sonner.tsx";
import "./assets/styles/index.css";

import { GoogleOAuthProvider } from '@react-oauth/google';

// 🧩 Ẩn lỗi "Extension context invalidated" khi reload (do Chrome extension)
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Extension context invalidated')) {
        event.preventDefault(); // chặn log lỗi ra console
    }
});

const GOOGLE_CLIENT_ID = "321259919923-e1p2b3v0v8idcsmqisofsv3pcu6mvbba.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <AuthInit>
          <RouterProvider router={routers} />
        </AuthInit>
        <Toaster position="top-right" richColors />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
