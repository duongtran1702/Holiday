import { PaymentResultPage } from './pages/PaymentResultPage';
export const paymentRoutes = [
    { path: '/payment/success', element: <PaymentResultPage status="success" /> },
    { path: '/payment/cancel', element: <PaymentResultPage status="cancel" /> }
];
