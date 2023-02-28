import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { store } from './redux/store.js'
import { Provider } from 'react-redux'
import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
        <Provider store={store}>
          <QueryProvider>
            <Routes pages={pages} />
          </QueryProvider>
          </Provider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
