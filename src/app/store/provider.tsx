// app/store/provider.tsx
'use client';

import React from 'react';
import { Provider } from 'react-redux'
import { container } from '@/utils/di/inversify.config';
import DefaultStore from '@/state-management/store/app-store';

interface Props {
  children: React.ReactNode;
}

const ReduxProvider: React.FC<Props> = ({ children }) => {
  const appStore = container.get(DefaultStore);
  return <Provider store={appStore.store!}>{children}</Provider>;
};

export default ReduxProvider;

