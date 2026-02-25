import { configureStore, EnhancedStore, Reducer } from '@reduxjs/toolkit';
import menuReducer from '../slices/menu-impl-slice';
import userReducer from '../slices/user-slice';
import chatReducer from '../slices/chat-slice';
import authReducer from '../slices/auth-slice';

export type RootState = ReturnType<DefaultStore['getState']>;
export type AppDispatch = DefaultStore['dispatch'];

export default class DefaultStore {
  store: EnhancedStore | undefined;
  asyncReducers: any = {};
  staticReducers = {
    menu: menuReducer,
    user: userReducer,
    chat: chatReducer,
    auth: authReducer,
  };

  constructor() {
    this.store = configureStore({
      reducer: {
        ...this.staticReducers,
        ...this.asyncReducers,
      },
    });
  }

  addReducerToStore(key: string, reducer: Reducer<any>) {
    if (this.asyncReducers[key]) {
      return;
    }
    this.asyncReducers[key] = reducer;

    this.store?.replaceReducer({
      ...this.staticReducers,
      ...this.asyncReducers,
    });
  }

  getState = () => {
    return this.store?.getState();
  };

  dispatch = (action: any) => {
    return this.store?.dispatch(action);
  };
}



