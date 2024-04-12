import { AppProps } from 'next/app';
import './_app.global.css';

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
