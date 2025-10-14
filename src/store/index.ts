import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productosReducer from "./slices/productosSlice";
import clientesReducer from "./slices/clientesSlice";
import empresasReducer from "./slices/empresasSlice";

// Configuración de persistencia solo para el slice de auth
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated"], // Solo persistir estos campos
};

// Combinar reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  productos: productosReducer,
  clientes: clientesReducer,
  empresas: empresasReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
