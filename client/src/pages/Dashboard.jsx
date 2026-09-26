import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL =
    import.meta.env.VITE_API_URL;

function Dashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const token =
        localStorage.getItem("token");

    const [stats, setStats] = useState({
    totalsByCurrency: {},
    totalTips: 0,
    topTipsByCurrency: {}
});

 const [tips, setTips] = useState([]);

    const [profile, setProfile] =
    useState({
        displayName: "",
        bio: "",
        profileImage: ""
    });


const [savingProfile, setSavingProfile] =
    useState(false);

    const [selectedImage, setSelectedImage] =
    useState(null);

const [uploadingImage, setUploadingImage] =
    useState(false);

   

    const [overlayKey, setOverlayKey] =
        useState("");

    const [loading, setLoading] =
        useState(true);
        const [alertSettings, setAlertSettings] =
    useState({
        duration: 8,
        minimumAmount: 1,
        showMessage: true,
        fontSize: 18
    });
const [brandingSettings, setBrandingSettings] =
    useState({
        accentColor: "#111111",
        buttonColor: "#111111",
        backgroundColor: "#f4f5f7",
        cardColor: "#ffffff",
        tipAmounts: [
            50,
            100,
            500,
            1000
        ]
    });

const [savingBranding, setSavingBranding] =
    useState(false);

const [savingSettings, setSavingSettings] =
    useState(false);

    useEffect(() => {
        const loadDashboard = async () => {

            if (!token) {
                navigate("/login");
                return;
            }

            try {

                const config = {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                };
                
                const profileResponse =
    await axios.get(
        `${API_URL}/api/dashboard/profile`,
        config
    );

setProfile({
    displayName:
        profileResponse.data.displayName || "",

    bio:
        profileResponse.data.bio || "",

    profileImage:
        profileResponse.data.profileImage || ""
});

const brandingResponse =
    await axios.get(
        `${API_URL}/api/dashboard/branding-settings`,
        config
    );

setBrandingSettings({
    accentColor:
        brandingResponse.data?.accentColor ||
        "#111111",

    buttonColor:
        brandingResponse.data?.buttonColor ||
        "#111111",

    backgroundColor:
        brandingResponse.data?.backgroundColor ||
        "#f4f5f7",

    cardColor:
        brandingResponse.data?.cardColor ||
        "#ffffff",

    tipAmounts:
        brandingResponse.data?.tipAmounts ||
        [50, 100, 500, 1000]
});
                const statsResponse =
                    await axios.get(
                        `${API_URL}/api/dashboard/stats`,
                        config
                    );

                const tipsResponse =
                    await axios.get(
                        `${API_URL}/api/dashboard/tips`,
                        config
                    );

                const overlayResponse =
                    await axios.post(
                        `${API_URL}/api/dashboard/overlay-key`,
                        {},
                        config
                    );

                    const settingsResponse =
    await axios.get(
        `${API_URL}/api/dashboard/alert-settings`,
        config
    );

setAlertSettings(
    settingsResponse.data
);

                setStats(
                    statsResponse.data
                );

                setTips(
                    tipsResponse.data
                );

                setOverlayKey(
                    overlayResponse.data.overlayKey
                );

            } catch (error) {

                console.error(
                    "Dashboard error:",
                    error
                );

                if (
                    error.response?.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    navigate("/login");
                }

            } finally {

                setLoading(false);
            }
        };

        loadDashboard();

    }, [navigate, token]);
    useEffect(() => {

    if (!user?.username || !token) {
        return;
    }

    const socket = io(
       `${API_URL}`
    );

    socket.emit(
        "joinStreamer",
        user.username
    );

    socket.on(
        "newTip",
        async () => {

            console.log(
                "New tip received - updating dashboard"
            );

            try {

                const config = {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                };

                const statsResponse =
                    await axios.get(
                        `${API_URL}/api/dashboard/stats`,
                        config
                    );

                const tipsResponse =
                    await axios.get(
                        `${API_URL}/api/dashboard/tips`,
                        config
                    );

                setStats(
                    statsResponse.data
                );

                setTips(
                    tipsResponse.data
                );

            } catch (error) {

                console.error(
                    "Live dashboard update error:",
                    error
                );
            }
        }
    );

    return () => {
        socket.disconnect();
    };

}, [user?.username, token]);

    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const copyToClipboard = async (text) => {

        try {

            await navigator.clipboard.writeText(
                text
            );

            alert("Copied!");

        } catch (error) {

            console.error(
                "Copy failed:",
                error
            );

            alert(
                "Unable to copy"
            );
        }
    };

    const tipUrl =
        `http://localhost:5173/${user?.username}`;

    const overlayUrl =
        overlayKey
            ? `http://localhost:5173/overlay/${overlayKey}`
            : "";

    if (loading) {
        return (
            <h2>
                Loading dashboard...
            </h2>
        );
    }

    const saveAlertSettings = async () => {

    try {

        setSavingSettings(true);

        const config = {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        };

        const response =
            await axios.put(
                `${API_URL}/api/dashboard/alert-settings`,
                alertSettings,
                config
            );

        setAlertSettings(
            response.data.alertSettings
        );

        alert(
            "Alert settings saved!"
        );

    } catch (error) {

        console.error(error);

        alert(
            error.response?.data?.message ||
            "Unable to save settings"
        );

    } finally {

        setSavingSettings(false);
    }
};

const sendTestAlert = async () => {

    try {

        const config = {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        };

        await axios.post(
            `${API_URL}/api/dashboard/test-alert`,
            {},
            config
        );

        alert(
            "Test alert sent!"
        );

    } catch (error) {

        console.error(error);

        alert(
            error.response?.data?.message ||
            "Unable to send test alert"
        );
    }
};

const saveProfile = async () => {
    try {
        setSavingProfile(true);

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        let finalProfileImage =
            profile.profileImage;

        // Upload image only if user selected a new one
        if (selectedImage) {

            const formData =
                new FormData();

            formData.append(
                "profileImage",
                selectedImage
            );

            const imageResponse =
                await axios.post(
                    `${API_URL}/api/dashboard/profile-image`,
                    formData,
                    config
                );

            finalProfileImage =
                imageResponse.data.profileImage;
        }

        // Save display name, bio and image URL
        const response =
            await axios.put(
                `${API_URL}/api/dashboard/profile`,
                {
                    displayName:
                        profile.displayName,

                    bio:
                        profile.bio,

                    profileImage:
                        finalProfileImage
                },
                config
            );

        setProfile({
            displayName:
                response.data.user.displayName,

            bio:
                response.data.user.bio,

            profileImage:
                response.data.user.profileImage
        });

        setSelectedImage(null);

        // Update localStorage display name
        const currentUser =
            JSON.parse(
                localStorage.getItem("user")
            );

        localStorage.setItem(
            "user",
            JSON.stringify({
                ...currentUser,
                displayName:
                    response.data.user.displayName
            })
        );

        alert("Profile saved!");

    } catch (error) {

        console.error(
            "SAVE PROFILE ERROR:",
            error
        );

        alert(
            error.response?.data?.message ||
            "Unable to save profile"
        );

    } finally {

        setSavingProfile(false);
    }
};
const saveBrandingSettings = async () => {

    try {

        setSavingBranding(true);

        const config = {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        };


        const response =
            await axios.put(
                `${API_URL}/api/dashboard/branding-settings`,
                brandingSettings,
                config
            );

        setBrandingSettings(
            response.data.brandingSettings
        );

        alert(
            "Branding settings saved!"
        );

    } catch (error) {

        console.error(error);

        alert(
            error.response?.data?.message ||
            "Unable to save branding settings"
        );

    } finally {

        setSavingBranding(false);
    }
};

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
        <div className="dashboard">

            <div className="dashboard-header">

                <div>

                    <h1>
                        Welcome, {user?.displayName}
                    </h1>

                    <p>
                        @{user?.username}
                    </p>

                </div>

                <button
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

           <div className="stats-grid">

    <div className="stat-card">

        <p>
            Total Received
        </p>

        <div>
            {Object.entries(
                stats.totalsByCurrency || {}
            ).length > 0 ? (

                Object.entries(
                    stats.totalsByCurrency
                ).map(
                    ([currency, amount]) => (

                        <h2 key={currency}>
                            {formatMoney(
                                amount,
                                currency
                            )}
                        </h2>

                    )
                )

            ) : (

                <h2>
                    ₹0
                </h2>

            )}
        </div>

    </div>


    <div className="stat-card">

        <p>
            Total Tips
        </p>

        <h2>
            {stats.totalTips || 0}
        </h2>

    </div>

<div className="stat-card">

    <p>
        Top Tip
    </p>

    <div>
        {Object.entries(
            stats.topTipsByCurrency || {}
        ).length > 0 ? (

            Object.entries(
                stats.topTipsByCurrency
            ).map(
                ([currency, amount]) => (

                    <h2 key={currency}>
                        {formatMoney(
                            amount,
                            currency
                        )}
                    </h2>

                )
            )

        ) : (

            <h2>
                ₹0
            </h2>

        )}
    </div>

</div>

</div>

            <div className="dashboard-links">

                <div>

                    <p>
                        Your Tip Link
                    </p>

                    <span>
                        {tipUrl}
                    </span>

                    <button
                        onClick={() =>
                            copyToClipboard(
                                tipUrl
                            )
                        }
                    >
                        Copy Tip Link
                    </button>

                </div>

                <div>

                    <p>
                        OBS Overlay URL
                    </p>

                    <span>
                        {
                            overlayUrl ||
                            "Loading..."
                        }
                    </span>

                    <button
                        disabled={!overlayUrl}
                        onClick={() =>
                            copyToClipboard(
                                overlayUrl
                            )
                        }
                    >
                        Copy OBS Link
                    </button>

                </div>

            </div>

<div className="alert-settings-section">

    <h2>
        Alert Settings
    </h2>

    <div className="settings-grid">

        <div>

            <label>
                Alert Duration
            </label>

            <input
                type="number"
                min="2"
                max="30"
                value={
                    alertSettings.duration
                }
                onChange={(e) =>
                    setAlertSettings({
                        ...alertSettings,

                        duration:
                            Number(
                                e.target.value
                            )
                    })
                }
            />

            <small>
                Seconds
            </small>

        </div>

        <div>

            <label>
                Minimum Tip Amount
            </label>

            <input
                type="number"
                min="1"
                value={
                    alertSettings.minimumAmount
                }
                onChange={(e) =>
                    setAlertSettings({
                        ...alertSettings,

                        minimumAmount:
                            Number(
                                e.target.value
                            )
                    })
                }
            />

        </div>

        <div>

            <label>
                Message Font Size
            </label>

            <input
                type="number"
                min="12"
                max="60"
                value={
                    alertSettings.fontSize
                }
                onChange={(e) =>
                    setAlertSettings({
                        ...alertSettings,

                        fontSize:
                            Number(
                                e.target.value
                            )
                    })
                }
            />

        </div>

        <div>

            <label>

                <input
                    type="checkbox"
                    checked={
                        alertSettings.showMessage
                    }
                    onChange={(e) =>
                        setAlertSettings({
                            ...alertSettings,

                            showMessage:
                                e.target.checked
                        })
                    }
                />

                Show viewer message

            </label>

        </div>

    </div>

    <button
        onClick={
            saveAlertSettings
        }
        disabled={
            savingSettings
        }
    >
        {
            savingSettings
                ? "Saving..."
                : "Save Alert Settings"
        }
    </button>

    <button
    type="button"
    onClick={sendTestAlert}
>
    Test OBS Alert
</button>

</div>
<div className="profile-settings-section">

    <h2>
        Profile Settings
    </h2>

    {profile.profileImage && (
        <img
            src={profile.profileImage}
            alt="Profile"
            className="dashboard-profile-image"
        />
    )}

    <div className="profile-form">

        <div>
            <label>
                Display Name
            </label>

            <input
                type="text"
                maxLength="50"
                value={
                    profile.displayName
                }
                onChange={(e) =>
                    setProfile({
                        ...profile,
                        displayName:
                            e.target.value
                    })
                }
            />
        </div>

        <div>
            <label>
                Bio
            </label>

            <textarea
                maxLength="200"
                value={
                    profile.bio
                }
                onChange={(e) =>
                    setProfile({
                        ...profile,
                        bio:
                            e.target.value
                    })
                }
                placeholder="Tell your viewers something about yourself..."
            />

            <small>
                {profile.bio.length}/200
            </small>
        </div>

        <div>

   <div>

    <label>
        Profile Image
    </label>

    <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) =>
            setSelectedImage(
                e.target.files[0] || null
            )
        }
    />

    {selectedImage && (
        <div>
            <p>New image preview:</p>

            <img
                src={URL.createObjectURL(
                    selectedImage
                )}
                alt="Preview"
                className="dashboard-profile-image"
            />
        </div>
    )}

</div>

</div>

    </div>

    <button
    type="button"
        onClick={saveProfile}
        disabled={savingProfile}
    >
        {savingProfile
            ? "Saving..."
            : "Save Profile"}
    </button>

</div>

<div className="branding-settings-section">

    <h2>
        Page Branding
    </h2>

    <div className="branding-grid">

        <div>
            <label>
                Accent Color
            </label>

            <input
                type="color"
                value={
                    brandingSettings.accentColor
                }
                onChange={(e) =>
                    setBrandingSettings({
                        ...brandingSettings,
                        accentColor:
                            e.target.value
                    })
                }
            />
        </div>

        <div>
            <label>
                Button Color
            </label>

            <input
                type="color"
                value={
                    brandingSettings.buttonColor
                }
                onChange={(e) =>
                    setBrandingSettings({
                        ...brandingSettings,
                        buttonColor:
                            e.target.value
                    })
                }
            />
        </div>

        <div>
            <label>
                Background Color
            </label>

            <input
                type="color"
                value={
                    brandingSettings.backgroundColor
                }
                onChange={(e) =>
                    setBrandingSettings({
                        ...brandingSettings,
                        backgroundColor:
                            e.target.value
                    })
                }
            />
        </div>

        <div>
            <label>
                Card Color
            </label>

            <input
                type="color"
                value={
                    brandingSettings.cardColor
                }
                onChange={(e) =>
                    setBrandingSettings({
                        ...brandingSettings,
                        cardColor:
                            e.target.value
                    })
                }
            />
        </div>

       <div className="custom-amounts-section">

    <h3>Preset Tip Amounts</h3>

    <p>
        Choose the four amounts viewers will see.
    </p>

    <div className="custom-amounts-grid">

        {(
            brandingSettings.tipAmounts ||
            [50, 100, 500, 1000]
        ).map((amount, index) => (

            <div key={index}>

                <label>
                    Amount {index + 1}
                </label>

                <div className="amount-input-wrapper">

                    <span>₹</span>

                    <input
                        type="number"
                        min="1"
                        max="100000"
                        value={amount}
                        onChange={(e) => {

                            const updatedAmounts = [
                                ...(
                                    brandingSettings.tipAmounts ||
                                    [50, 100, 500, 1000]
                                )
                            ];

                            updatedAmounts[index] =
                                e.target.value === ""
                                    ? ""
                                    : Number(e.target.value);

                            setBrandingSettings({
                                ...brandingSettings,
                                tipAmounts: updatedAmounts
                            });

                        }}
                    />

                </div>

            </div>

        ))}

    </div>

</div>

    </div>
    <div
    className="branding-preview"
    style={{
        background:
            brandingSettings.backgroundColor
    }}
>
    <div
        className="branding-preview-card"
        style={{
            background:
                brandingSettings.cardColor
        }}
    >

        {profile.profileImage && (
            <img
                src={profile.profileImage}
                alt="Profile"
                className="branding-preview-image"
            />
        )}

        <h3>
            {profile.displayName || "Streamer Name"}
        </h3>

        <p>
            @{user?.username}
        </p>

        {profile.bio && (
            <p>
                {profile.bio}
            </p>
        )}

       <div className="branding-preview-amounts">
{(
    brandingSettings.tipAmounts ||
    [50, 100, 500, 1000]
).map((amount, index) => (

            <button
                key={index}
                type="button"
                style={
                    index === 0
                        ? {
                            background:
                                brandingSettings
                                    .accentColor,

                            borderColor:
                                brandingSettings
                                    .accentColor,

                            color:
                                "white"
                        }
                        : {}
                }
            >
                ₹{amount}
            </button>

        )
    )}

</div>

        <input
            type="text"
            placeholder="Your name"
            disabled
        />

        <textarea
            placeholder="Your message..."
            disabled
        />

        <button
            type="button"
            className="branding-preview-send"
            style={{
                background:
                    brandingSettings.buttonColor
            }}
        >
            Send Tip ₹100
        </button>

    </div>
</div>

    <button
        type="button"
        onClick={saveBrandingSettings}
        disabled={savingBranding}
    >
        {savingBranding
            ? "Saving..."
            : "Save Branding"}
    </button>

</div>
            
            <div className="tips-section">
                        
             <div className="recent-tips-header">

    <h2>Recent Tips</h2>

    <button
        type="button"
        className="view-all-tips-button"
        onClick={() =>
            navigate("/dashboard/tips")
        }
    >
        View All Tips
    </button>

</div>
                {
                    tips.length === 0
                        ? (
                            <p>
                                No paid tips yet.
                            </p>
                        )
                        : (
                            <div className="tips-table">

                                {
                                    tips.map(
                                        (tip) => (

                                            <div
                                                className="tip-row"
                                                key={tip._id}
                                            >

                                                <div>

                                                    <strong>
                                                        {
                                                            tip.donorName
                                                        }
                                                    </strong>

                                                    <p>
                                                        {
                                                            tip.message
                                                        }
                                                    </p>

                                                </div>

                                                <strong>
                                                 {formatMoney(
    tip.amount,
    tip.currency
)}
                                                </strong>

                                            </div>

                                        )
                                    )
                                }

                            </div>
                        )
                }

            </div>

        </div>
    );
}

export default Dashboard;