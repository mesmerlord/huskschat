import { Provider, useCreateStore } from "@/store/store";
import { MantineProvider, createEmotionCache } from "@mantine/core";
import { useState } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";

const myCache = createEmotionCache({ key: "mantine" });

const Providers = ({ children, pageProps }) => {
  const createStore = useCreateStore(pageProps?.initialZustandState);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider createStore={createStore}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps?.dehydratedState}>
          <MantineProvider
            emotionCache={myCache}
            withGlobalStyles
            withNormalizeCSS
          >
            {children}
          </MantineProvider>
        </Hydrate>
      </QueryClientProvider>
    </Provider>
  );
};
export default Providers;
