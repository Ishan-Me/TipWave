import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

        <div className="tip-history-page">

            <div className="tip-history-header">

                <div>
                    <h1>Tip History</h1>

                    <div className="tip-history-filters">

    <input
        type="text"
        placeholder="Search supporter, message or payment ID..."
        value={search}
        onChange={(e) =>
            setSearch(e.target.value)
        }
    />

    <select
        value={currencyFilter}
        onChange={(e) =>
            setCurrencyFilter(e.target.value)
        }
    >
        <option value="ALL">
            All Currencies
        </option>

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
                
                    <p>
                        View all your successful tips.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    Back to Dashboard
                </button>

            </div>


            {tips.length === 0 ? (

                <div className="no-tips">
                    No tips received yet.
                </div>

            ) : (

                <div className="tip-history-table-wrapper">

                    <table className="tip-history-table">
{tips.length === 0 && (
    <p className="no-filtered-tips">
        No matching tips found.
    </p>
)}
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

                                    <td>
                                        {new Date(
                                            tip.createdAt
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {tip.donorName ||
                                            "Anonymous"}
                                    </td>

                                    <td>
                                        {formatMoney(
                                            tip.amount,
                                            tip.currency ||
                                                "INR"
                                        )}
                                    </td>

                                    <td>
                                        {tip.message ||
                                            "—"}
                                    </td>

                                    <td>
                                        {tip.razorpayPaymentId ||
                                            "—"}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
{pagination.totalPages > 1 && (

    <div className="tip-pagination">

        <button
            type="button"
            disabled={
                pagination.currentPage <= 1
            }
            onClick={() =>
                setPage(
                    pagination.currentPage - 1
                )
            }
        >
            Previous
        </button>

        <span>
            Page{" "}
            {pagination.currentPage}
            {" "}of{" "}
            {pagination.totalPages}
        </span>

        <button
            type="button"
            disabled={
                pagination.currentPage >=
                pagination.totalPages
            }
            onClick={() =>
                setPage(
                    pagination.currentPage + 1
                )
            }
        >
            Next
        </button>

    </div>

)}
                </div>

            )}

        </div>
    );
}

export default TipHistory;