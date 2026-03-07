import {Head, Html, Main, NextScript} from 'next/document'
import Script from "next/script";
import * as React from "react";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <Script async
                        id="google-adsense"
                        strategy="lazyOnload"
                        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2166220223651523"
                        crossOrigin="anonymous">

                </Script>
                <Script strategy="afterInteractive" async
                        src="https://www.googletagmanager.com/gtag/js?id=G-BBBSQTGFNQ"></Script>
                <Script
                    id='google-analytics'
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'G-BBBSQTGFNQ', {
                            page_path: window.location.pathname,
                            });
                         `,
                    }}
                />
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}
