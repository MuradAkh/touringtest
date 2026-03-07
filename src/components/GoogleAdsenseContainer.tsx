import { useEffect } from 'react';

type GoogleAdsenseContainerProps = {
    client: string,
    slot: string
}

export function GoogleAdsenseContainer ( {client, slot} : GoogleAdsenseContainerProps) {
    useEffect(() => {
        let w : any = window;
        try {
            (w.adsbygoogle = w.adsbygoogle || []).push({});
        } catch (err) {
            console.log(err);
        }
    }, []);

    if (localStorage.getItem("cookies") !== "true") {
        console.log("Not showing ads because cookies are not accepted")
        return <div></div>
    }

    return (
        <div
            style={{textAlign: 'left',overflow: 'hidden'}}
        >
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>

        </div>
    );
}