import Layout from "./Layout";
import Providers from "./Providers";

interface AppProps {
  Component: any;
  pageProps: any;
}

const WrappedApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Providers pageProps={pageProps}>
      <Layout component={Component}>
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
};
export default WrappedApp;
