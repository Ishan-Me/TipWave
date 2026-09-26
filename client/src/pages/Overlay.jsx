import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL =
    import.meta.env.VITE_API_URL;

const socket = io(
   API_URL
);

function Overlay() {

    const { overlayKey } =
        useParams();

    const [tip, setTip] =
        useState(null);

    const [error, setError] =
        useState("");

    const [settings, setSettings] =
        useState({
            duration: 8,
            minimumAmount: 1,
            showMessage: true,
            fontSize: 18
        });

    // Stores latest settings
    const settingsRef =
        useRef(settings);

    // Stores tips waiting to display
    const queueRef =
        useRef([]);

    // Prevents two alerts displaying together
    const isShowingRef =
        useRef(false);

    // Stores timeout
    const timeoutRef =
        useRef(null);


    useEffect(() => {

        settingsRef.current =
            settings;

    }, [settings]);


    useEffect(() => {

        let isMounted = true;

        const showNextTip = () => {

            if (
                isShowingRef.current ||
                queueRef.current.length === 0
            ) {
                return;
            }

            const nextTip =
                queueRef.current.shift();

            isShowingRef.current = true;

            setTip(nextTip);

            const duration =
                settingsRef.current.duration;

            timeoutRef.current =
                setTimeout(() => {

                    if (!isMounted) {
                        return;
                    }

                    setTip(null);

                    isShowingRef.current =
                        false;

                    timeoutRef.current =
                        null;

                    // Small gap between alerts
                    setTimeout(() => {

                        if (isMounted) {
                            showNextTip();
                        }

                    }, 500);

                }, duration * 1000);
        };


        const connectOverlay =
            async () => {

                try {

                    const response =
                        await axios.get(
                           `${API_URL}/api/streamers/overlay/${overlayKey}`
                        );

                    const streamer =
                        response.data;

                    if (
                        streamer.alertSettings
                    ) {

                        setSettings(
                            streamer.alertSettings
                        );

                        settingsRef.current =
                            streamer.alertSettings;
                    }

                    socket.emit(
                        "joinStreamer",
                        streamer.username
                    );

                } catch (error) {

                    console.error(
                        "Overlay error:",
                        error
                    );

                    setError(
                        "Invalid overlay URL"
                    );
                }
            };


        const handleNewTip =
            (data) => {

                console.log(
                    "New tip:",
                    data
                );

                const minimumAmount =
                    settingsRef.current
                        .minimumAmount;

                if (
                    Number(data.amount) <
                    minimumAmount
                ) {

                    console.log(
                        "Tip below minimum alert amount"
                    );

                    return;
                }

                // Add new tip to queue
                queueRef.current.push(
                    data
                );

                // Try displaying next tip
                showNextTip();
            };


        connectOverlay();

        socket.on(
            "newTip",
            handleNewTip
        );


        return () => {

            isMounted = false;

            socket.off(
                "newTip",
                handleNewTip
            );

            if (
                timeoutRef.current
            ) {

                clearTimeout(
                    timeoutRef.current
                );
            }

            queueRef.current = [];

            isShowingRef.current =
                false;
        };

    }, [overlayKey]);


    if (error) {

        return (
            <div>
                {error}
            </div>
        );
    }

    const formatMoney = (amount, currency = "INR") => {
    try {
        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 2
            }
        ).format(amount);
    } catch {
        return `${currency} ${amount}`;
    }
};


    return (

        <div className="overlay-page">

            {tip && (

                <div className="tip-alert">

                    <h2>
                        🎉 NEW TIP 🎉
                    </h2>

                    <h1>
                        {formatMoney(
    tip.amount,
    tip.currency
)}
                    </h1>

                    <h3>
                        from {tip.donorName}
                    </h3>

                    {
                        settings.showMessage && (

                            <p
                                style={{
                                    fontSize:
                                        `${settings.fontSize}px`
                                }}
                            >

                                {tip.message}

                            </p>

                        )
                    }

                </div>

            )}

        </div>
    );
}

export default Overlay;