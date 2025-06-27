import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import appReducer from "@/features/appSlice";
import priceReducer from "@/features/price/priceSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    price: priceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
