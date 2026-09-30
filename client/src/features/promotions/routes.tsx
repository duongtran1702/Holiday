import { AdminPromotions } from './pages/AdminPromotions';
import { MyPromotions } from './pages/MyPromotions';

export const promotionAdminRoutes = [{ path: 'promotions', element: <AdminPromotions /> }];
export const promotionUserRoutes = [{ path: 'promotions', element: <MyPromotions /> }];
