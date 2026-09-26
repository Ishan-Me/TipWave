import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/TipHistory.css';

const API_URL =
    import.meta.env.VITE_API_URL;


function TipHistory() {

    const navigate = useNavigate();

    const token =
        localStorage.getItem("token");

    const [tips, setTips] =
        useState([]);

        const [search, setSearch] = useState("");
const [currencyFilter, setCurrencyFilter] =
    useState("ALL");

    const [loading, setLoading] =
        useState(true);

        const [page, setPage] = useState(1);

const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTips: 0,
    limit: 10
});



const [debouncedSearch, setDebouncedSearch] =
    useState("");

    const formatMoney = (
        amount,
        currency = "INR"
    ) => {

        try {

            return new Intl.NumberFormat(
                "en-US",
                {
                    style: "currency",
                    currency: currency,
                    maximumFractionDigits: 2
                }
            ).format(amount);

        } catch {

            return `${currency} ${amount}`;
        }
    };

    useEffect(() => {

    const timer = setTimeout(() => {

        setDebouncedSearch(search);

    }, 500);

    return () => {
        clearTimeout(timer);
    };

}, [search]);

    useEffect(() => {

        const loadTipHistory =
            async () => {

                if (!token) {
                    navigate("/login");
                    return;
                }

                try {

                    const response =
    await axios.get(
       `${API_URL}/api/dashboard/tip-history?page=${page}&limit=10&search=${encodeURIComponent(debouncedSearch)}&currency=${currencyFilter}`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`
            }
        }
    );

                   setTips(response.data.tips);

setPagination(
    response.data.pagination
);

                } catch (error) {

                    console.error(
                        "Unable to load tip history:",
                        error
                    );

                    if (
                        error.response?.status === 401
                    ) {
                        localStorage.removeItem(
                            "token"
                        );

                        navigate("/login");
                    }

                } finally {

                    setLoading(false);
                }
            };

        loadTipHistory();

  }, [
    token,
    navigate,
    page,
    debouncedSearch,
    currencyFilter
]);

useEffect(() => {

    setPage(1);

}, [debouncedSearch, currencyFilter]);

    if (loading) {
        return (
            <div>
                Loading tip history...
            </div>
        );
    }

    return (
    <div className="history-page">

        {/* ================= TOPBAR ================= */}

        <header className="history-topbar">

            <div className="history-brand">
                <div className="history-brand-icon">
                    T
                </div>

                <span>TipWave</span>
            </div>

            <button
                type="button"
                className="history-back-button"
                onClick={() =>
                    navigate("/dashboard")
                }
            >
                ← Back to Dashboard
            </button>

        </header>


        {/* ================= CONTENT ================= */}

        <main className="history-content">

            {/* PAGE HEADING */}

            <section className="history-heading">

                <p className="history-eyebrow">
                    PAYMENTS
                </p>

                <h1>Tip History</h1>

                <p>
                    View and search all your successful tips.
                </p>

            </section>


            {/* ================= MAIN CARD ================= */}

            <section className="history-card">

                {/* CARD HEADER */}

                <div className="history-card-header">

                    <div>

                        <h2>
                            All Tips
                        </h2>

                        <p>
                            {pagination.totalTips || 0}{" "}
                            {(pagination.totalTips || 0) === 1
                                ? "successful tip"
                                : "successful tips"}
                        </p>

                    </div>


                    {/* FILTERS */}

                    <div className="history-filters">

                        <div className="history-search">

                            <span className="history-search-icon">
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search supporter, message or payment ID..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <select
                            className="history-currency-filter"
                            value={currencyFilter}
                            onChange={(e) =>
                                setCurrencyFilter(
                                    e.target.value
                                )
                            }
                        >
                            <option value="ALL">
                                All Currencies
                            </option>

                            <option value="INR">
                                INR
                            </option>

                            <option value="USD">
                                USD
                            </option>

                            <option value="EUR">
                                EUR
                            </option>

                            <option value="GBP">
                                GBP
                            </option>

                            <option value="CHF">
                                CHF
                            </option>

                            <option value="SGD">
                                SGD
                            </option>

                            <option value="CAD">
                                CAD
                            </option>

                            <option value="AUD">
                                AUD
                            </option>

                        </select>

                    </div>

                </div>


                {/* ================= EMPTY STATE ================= */}

                {tips.length === 0 ? (

                    <div className="history-empty">

                        <div className="history-empty-icon">
                            ♡
                        </div>

                        <h3>
                            {search ||
                            currencyFilter !== "ALL"
                                ? "No matching tips"
                                : "No tips yet"}
                        </h3>

                        <p>
                            {search ||
                            currencyFilter !== "ALL"
                                ? "Try changing your search or currency filter."
                                : "Your successful tips will appear here."}
                        </p>

                    </div>

                ) : (

                    <>
                        {/* ================= TABLE ================= */}

                        <div className="history-table-wrapper">

                            <table className="history-table">

                                <thead>

                                    <tr>
                                        <th>Date</th>
                                        <th>Supporter</th>
                                        <th>Amount</th>
                                        <th>Message</th>
                                        <th>Payment ID</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    {tips.map((tip) => (

                                        <tr key={tip._id}>

                                            {/* DATE */}

                                            <td>

                                                <div className="history-date">

                                                    <strong>
                                                        {new Date(
                                                            tip.createdAt
                                                        ).toLocaleDateString()}
                                                    </strong>

                                                    <span>
                                                        {new Date(
                                                            tip.createdAt
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour:
                                                                    "2-digit",
                                                                minute:
                                                                    "2-digit"
                                                            }
                                                        )}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* SUPPORTER */}

                                            <td>

                                                <div className="history-supporter">

                                                    <div className="history-supporter-avatar">

                                                        {(tip.donorName ||
                                                            "A")
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>

                                                    <strong>
                                                        {tip.donorName ||
                                                            "Anonymous"}
                                                    </strong>

                                                </div>

                                            </td>


                                            {/* AMOUNT */}

                                            <td>

                                                <strong className="history-amount">

                                                    {formatMoney(
                                                        tip.amount,
                                                        tip.currency ||
                                                            "INR"
                                                    )}

                                                </strong>

                                            </td>


                                            {/* MESSAGE */}

                                            <td>

                                                <span className="history-message">

                                                    {tip.message ||
                                                        "—"}

                                                </span>

                                            </td>


                                            {/* PAYMENT ID */}

                                            <td>

                                                <span
                                                    className="history-payment-id"
                                                    title={
                                                        tip.razorpayPaymentId ||
                                                        ""
                                                    }
                                                >

                                                    {tip.razorpayPaymentId ||
                                                        "—"}

                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>


                        {/* ================= PAGINATION ================= */}

                        {pagination.totalPages > 1 && (

                            <div className="history-pagination">

                                <div className="history-page-info">

                                    Page{" "}
                                    <strong>
                                        {pagination.currentPage}
                                    </strong>{" "}
                                    of{" "}
                                    <strong>
                                        {pagination.totalPages}
                                    </strong>

                                </div>


                                <div className="history-page-buttons">

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.currentPage <=
                                            1
                                        }
                                        onClick={() =>
                                            setPage(
                                                pagination.currentPage -
                                                    1
                                            )
                                        }
                                    >
                                        ← Previous
                                    </button>


                                    <button
                                        type="button"
                                        disabled={
                                            pagination.currentPage >=
                                            pagination.totalPages
                                        }
                                        onClick={() =>
                                            setPage(
                                                pagination.currentPage +
                                                    1
                                            )
                                        }
                                    >
                                        Next →
                                    </button>

                                </div>

                            </div>

                        )}

                    </>

                )}

            </section>

        </main>

    </div>
);
}

export default TipHistory;