import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL;


const TIP_LIMITS = {
    INR: {
        min: 10,
        max: 50000
    },

    USD: {
        min: 1,
        max: 1000
    },

    EUR: {
        min: 1,
        max: 1000
    },

    GBP: {
        min: 1,
        max: 1000
    },

    CHF: {
        min: 1,
        max: 1000
    },

    SGD: {
        min: 1,
        max: 1000
    },

    CAD: {
        min: 1,
        max: 1000
    },

    AUD: {
        min: 1,
        max: 1000
    }
};


function TipPage() {
    const { username } = useParams();

    const [streamer, setStreamer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [amount, setAmount] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [termsAccepted, setTermsAccepted] =
        useState(false);
        const [currency, setCurrency] = useState("INR");
        const [paymentSuccess, setPaymentSuccess] = useState(false);
        const [paymentError, setPaymentError] = useState("");

    useEffect(() => {
        const getStreamer = async () => {
            try {
                const response = await axios.get(
                   `${API_URL}/api/streamers/${username}`
                );

                setStreamer(response.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load streamer"
                );
            } finally {
                setLoading(false);
            }
        };

        getStreamer();
    }, [username]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!amount || !name || !message) {
            alert("Please fill all required fields");
            return;
        }

      const numericAmount = Number(amount);

if (!Number.isFinite(numericAmount)) {
    alert("Enter a valid amount");
    return;
}

const limits = TIP_LIMITS[currency];

if (!limits) {
    alert("Unsupported currency");
    return;
}

if (numericAmount < limits.min) {
    alert(
        `Minimum tip amount is ${currency} ${limits.min}`
    );
    return;
}

if (numericAmount > limits.max) {
    alert(
        `Maximum tip amount is ${currency} ${limits.max}`
    );
    return;
}

        if (!termsAccepted) {
            alert("Please accept the terms");
            return;
        }
setPaymentError("");
        try {
            const response = await axios.post(
                 `${API_URL}/api/payments/create-order`,
                {
                    streamerUsername:
                        streamer.username,
                    donorName: name,
                    donorEmail: email,
                    amount: Number(amount),
                       currency:
            currency,
                    message
                }
            );

            const data = response.data;

            const options = {
                key: data.key,
                amount: data.amount,
                currency: data.currency,
                name: "TipWave",

                description:
                    `Tip for ${data.streamer.displayName}`,

                order_id: data.orderId,

                handler: async function (
                    paymentResponse
                ) {
                    try {
                        await axios.post(
                             `${API_URL}/api/payments/verify`,
                            paymentResponse
                        );

                    setPaymentError("");
                        setPaymentSuccess(true);
                        setAmount("");
                        setName("");
                        setEmail("");
                        setMessage("");
                        setTermsAccepted(false);

                    } catch (error) {
                        alert(
                            "Payment verification failed"
                        );
                    }
                },

                prefill: {
                    name,
                    email
                }
            };

            const razorpay =
                new window.Razorpay(options);

                razorpay.on(
    "payment.failed",
    function (response) {

        console.error(
            "Payment failed:",
            response.error
        );

        setPaymentError(
            response.error?.description ||
            "Payment failed. Please try again."
        );
    }
);

            razorpay.open();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to start payment"
            );
        }
    };

    if (loading) {
        return (
            <div className="tip-page">
                <h2>Loading...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tip-page">
                <h2>{error}</h2>
            </div>
        );
    }

    const branding =
    streamer.brandingSettings || {
        accentColor: "#111111",
        buttonColor: "#111111",
        backgroundColor: "#f4f5f7",
        cardColor: "#ffffff"
    };


    if (paymentSuccess) {
    return (
        <div className="tip-page">

            <div className="tip-card">

                <div className="payment-success">

                    <div className="success-icon">
                        ✓
                    </div>

                    <h2>
                        Tip Sent Successfully!
                    </h2>

                    <p>
                        Your tip was sent to{" "}
                        <strong>
                            {streamer.displayName}
                        </strong>.
                    </p>

                    <button
                        type="button"
                        className="send-tip-button"
                        style={{
                            background:
                                branding.buttonColor,
                            color: "#ffffff"
                        }}
                        onClick={() =>
                            setPaymentSuccess(false)
                        }
                    >
                        Send Another Tip
                    </button>

                </div>

            </div>

        </div>
    );
}

    return (
       <div
    className="tip-page"
    style={{
        background:
            branding.backgroundColor
    }}
>

            <div
    className="tip-card"
    style={{
        background:
            branding.cardColor
    }}
>

                <div className="streamer-header">

                    {streamer.profileImage ? (
                        <img
                            src={streamer.profileImage}
                            alt={streamer.displayName}
                            className="profile-image"
                        />
                    ) : (
                        <div className="profile-placeholder">
                            {streamer.displayName
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>
                    )}

                    <h1>
                        {streamer.displayName}
                    </h1>

                    <p className="streamer-username">
                        @{streamer.username}
                    </p>

                    {streamer.bio && (
                        <p className="streamer-bio">
                            {streamer.bio}
                        </p>
                    )}

                </div>

                <form onSubmit={handleSubmit} className="tip-form">

    <div className="form-group">
        <label>Amount:</label>

        <div className="amount-currency-row">

            <input
                type="number"
                min="1"
                placeholder="200"
                value={amount}
                onChange={(e) =>
                    setAmount(e.target.value)
                }
            />

            <select
                value={currency}
                onChange={(e) =>
                    setCurrency(e.target.value)
                }
            >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CHF">CHF</option>
                <option value="SGD">SGD</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
            </select>

        </div>
    </div>

    <div className="form-group">
        <label>Email for Payment Receipt:</label>

        <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) =>
                setEmail(e.target.value)
            }
        />
    </div>

    <div className="form-group">
        <label>Name:</label>

        <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) =>
                setName(e.target.value)
            }
        />
    </div>

    <div className="form-group">
        <label>Message:</label>

        <textarea
            placeholder={`Message for ${streamer.displayName}`}
            maxLength="200"
            value={message}
            onChange={(e) =>
                setMessage(e.target.value)
            }
        />

        <div className="message-count">
            {200 - message.length} characters left
        </div>
    </div>

    <label className="terms-box">

        <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) =>
                setTermsAccepted(
                    e.target.checked
                )
            }
        />

        <span>
            I acknowledge this is a non-refundable
            transaction, fully rendered once displayed
            to {streamer.displayName}. I also agree to
            the Terms & Refund Policy.
        </span>

    </label>

    {paymentError && (

    <div className="payment-error">
        {paymentError}
    </div>

)}

    <button
        type="submit"
        className="send-tip-button"
        style={{
            background:
                branding.buttonColor,
            color: "#ffffff"
        }}
    >
        {amount
            ? `Send Tip ${currency} ${amount}`
            : "Send Tip"}
    </button>

</form>
            </div>

        </div>
    );
}

export default TipPage;