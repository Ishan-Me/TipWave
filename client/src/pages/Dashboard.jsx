import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import '../styles/Dashboard.css';

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

    const tipUrl = `${window.location.origin}/${user?.username}`;

    const overlayUrl = `${window.location.origin}/overlay/${user?.overlayKey}`;

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
    <div className="dashboard-page">

        {/* ================= HEADER ================= */}

        <header className="dashboard-topbar">

            <div className="dashboard-brand">
                <div className="dashboard-brand-icon">
                    T
                </div>

                <span>TipWave</span>
            </div>

            <div className="dashboard-user-actions">

                <div className="dashboard-user">
                    <span className="dashboard-user-name">
                        {user?.displayName || user?.username}
                    </span>

                    <span className="dashboard-user-username">
                        @{user?.username}
                    </span>
                </div>

                <button
                    type="button"
                    className="dashboard-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </header>


        {/* ================= CONTENT ================= */}

        <main className="dashboard-content">

            {/* PAGE HEADING */}

            <section className="dashboard-heading">

                <div>
                    <p className="dashboard-eyebrow">
                        CREATOR DASHBOARD
                    </p>

                    <h1>
                        Welcome back,{" "}
                        {user?.displayName || user?.username}
                    </h1>

                    <p className="dashboard-subtitle">
                        Manage your tips, profile and stream alerts.
                    </p>
                </div>

            </section>


            {/* ================= STATS ================= */}

            <section className="dashboard-stats">

                {/* TOTAL RECEIVED */}

                <div className="dashboard-stat-card">

                    <div className="stat-icon">
                        ₹
                    </div>

                    <div className="stat-content">

                        <p className="stat-label">
                            Total Received
                        </p>

                        <div className="stat-values">

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

                                <h2>₹0</h2>

                            )}

                        </div>

                        <span className="stat-description">
                            From completed tips
                        </span>

                    </div>

                </div>


                {/* TOTAL TIPS */}

                <div className="dashboard-stat-card">

                    <div className="stat-icon">
                        #
                    </div>

                    <div className="stat-content">

                        <p className="stat-label">
                            Total Tips
                        </p>

                        <h2>
                            {stats.totalTips || 0}
                        </h2>

                        <span className="stat-description">
                            Successful contributions
                        </span>

                    </div>

                </div>


                {/* TOP TIP */}

                <div className="dashboard-stat-card">

                    <div className="stat-icon">
                        ↑
                    </div>

                    <div className="stat-content">

                        <p className="stat-label">
                            Top Tip
                        </p>

                        <div className="stat-values">

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

                                <h2>₹0</h2>

                            )}

                        </div>

                        <span className="stat-description">
                            Highest contribution
                        </span>

                    </div>

                </div>

            </section>


            {/* ================= LINKS ================= */}

            <section className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <h2>Your Links</h2>

                        <p>
                            Share your tip page and connect your
                            OBS overlay.
                        </p>
                    </div>
                </div>


                <div className="dashboard-link-grid">

                    {/* TIP LINK */}

                    <div className="dashboard-link-card">

                        <div className="link-card-header">

                            <div className="link-icon">
                                ↗
                            </div>

                            <div>
                                <h3>Tip Page</h3>

                                <p>
                                    Share this link with your viewers.
                                </p>
                            </div>

                        </div>


                        <div className="link-value">
                            <span>
                                {tipUrl}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    copyToClipboard(tipUrl)
                                }
                            >
                                Copy
                            </button>
                        </div>

                    </div>


                    {/* OBS LINK */}

                    <div className="dashboard-link-card">

                        <div className="link-card-header">

                            <div className="link-icon">
                                ◉
                            </div>

                            <div>
                                <h3>OBS Overlay</h3>

                                <p>
                                    Add this URL as an OBS Browser Source.
                                </p>
                            </div>

                        </div>


                        <div className="link-value">

                            <span>
                                {overlayUrl || "Loading..."}
                            </span>

                            <button
                                type="button"
                                disabled={!overlayUrl}
                                onClick={() =>
                                    copyToClipboard(
                                        overlayUrl
                                    )
                                }
                            >
                                Copy
                            </button>

                        </div>

                    </div>

                </div>

            </section>


            {/* ================= SETTINGS GRID ================= */}

            <div className="dashboard-settings-grid">


                {/* ================= PROFILE ================= */}

                <section className="dashboard-panel profile-panel">

                    <div className="panel-heading">

                        <div>
                            <h2>Profile</h2>

                            <p>
                                Manage how viewers see you.
                            </p>
                        </div>

                    </div>


                    <div className="dashboard-profile-header">

                        {selectedImage ? (

                            <img
                                src={URL.createObjectURL(
                                    selectedImage
                                )}
                                alt="Preview"
                                className="dashboard-new-avatar"
                            />

                        ) : profile.profileImage ? (

                            <img
                                src={profile.profileImage}
                                alt="Profile"
                                className="dashboard-new-avatar"
                            />

                        ) : (

                            <div className="dashboard-avatar-placeholder">
                                {(profile.displayName ||
                                    user?.username ||
                                    "?")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                        )}


                        <div className="profile-upload-area">

                            <strong>
                                Profile picture
                            </strong>

                            <span>
                                PNG, JPG or WebP
                            </span>

                            <label className="profile-upload-button">

                                Change image

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={(e) =>
                                        setSelectedImage(
                                            e.target.files[0] ||
                                            null
                                        )
                                    }
                                />

                            </label>

                        </div>

                    </div>


                    <div className="dashboard-form-group">

                        <label>
                            Display Name
                        </label>

                        <input
                            type="text"
                            maxLength="50"
                            value={profile.displayName}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    displayName:
                                        e.target.value
                                })
                            }
                            placeholder="Your display name"
                        />

                    </div>


                    <div className="dashboard-form-group">

                        <div className="dashboard-label-row">

                            <label>
                                Bio
                            </label>

                            <span>
                                {profile.bio.length}/200
                            </span>

                        </div>

                        <textarea
                            maxLength="200"
                            value={profile.bio}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    bio: e.target.value
                                })
                            }
                            placeholder="Tell your viewers something about yourself..."
                        />

                    </div>


                    <button
                        type="button"
                        className="dashboard-primary-button"
                        onClick={saveProfile}
                        disabled={savingProfile}
                    >
                        {savingProfile
                            ? "Saving..."
                            : "Save Profile"}
                    </button>

                </section>


                {/* ================= ALERT SETTINGS ================= */}

                <section className="dashboard-panel alerts-panel">

                    <div className="panel-heading">

                        <div>
                            <h2>Alert Settings</h2>

                            <p>
                                Configure your OBS tip alerts.
                            </p>
                        </div>

                    </div>


                    <div className="alert-form-grid">

                        <div className="dashboard-form-group">

                            <label>
                                Alert Duration
                            </label>

                            <div className="input-with-suffix">

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

                                <span>sec</span>

                            </div>

                        </div>


                        <div className="dashboard-form-group">

                            <label>
                                Minimum Tip
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


                        <div className="dashboard-form-group">

                            <label>
                                Message Font Size
                            </label>

                            <div className="input-with-suffix">

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

                                <span>px</span>

                            </div>

                        </div>

                    </div>


                    <label className="dashboard-toggle-row">

                        <div>

                            <strong>
                                Show viewer message
                            </strong>

                            <span>
                                Display the viewer's message
                                in your OBS alert.
                            </span>

                        </div>

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

                    </label>


                    <div className="alert-actions">

                        <button
                            type="button"
                            className="dashboard-primary-button"
                            onClick={saveAlertSettings}
                            disabled={savingSettings}
                        >
                            {savingSettings
                                ? "Saving..."
                                : "Save Settings"}
                        </button>

                        <button
                            type="button"
                            className="dashboard-secondary-button"
                            onClick={sendTestAlert}
                        >
                            Test OBS Alert
                        </button>

                    </div>

                </section>

            </div>


            {/* ================= RECENT TIPS ================= */}

            <section className="dashboard-panel recent-tips-panel">

                <div className="recent-tips-new-header">

                    <div>
                        <h2>Recent Tips</h2>

                        <p>
                            Your latest successful contributions.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="view-all-new-button"
                        onClick={() =>
                            navigate("/dashboard/tips")
                        }
                    >
                        View all tips →
                    </button>

                </div>


                {tips.length === 0 ? (

                    <div className="dashboard-empty-state">

                        <div className="empty-state-icon">
                            ♡
                        </div>

                        <h3>
                            No tips yet
                        </h3>

                        <p>
                            Your latest paid tips will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="dashboard-tips-list">

                        {tips.map((tip) => (

                            <div
                                className="dashboard-tip-item"
                                key={tip._id}
                            >

                                <div className="tip-user-avatar">
                                    {tip.donorName
                                        ?.charAt(0)
                                        .toUpperCase() || "?"}
                                </div>


                                <div className="tip-information">

                                    <strong>
                                        {tip.donorName}
                                    </strong>

                                    <p>
                                        {tip.message}
                                    </p>

                                </div>


                                <strong className="tip-value">
                                    {formatMoney(
                                        tip.amount,
                                        tip.currency
                                    )}
                                </strong>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </main>

    </div>
);
}

export default Dashboard;