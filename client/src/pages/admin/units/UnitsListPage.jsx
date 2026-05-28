import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import axios from "axios";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_API_BASE_URL;

function UnitsListPage() {
    const [units, setUnits] = useState([]);

    useEffect(() => {
        async function fetchUnits() {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(`${api}/admin/units`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUnits(response.data.units);
            } catch (error) {
                console.error(
                    "Failed to fetch units:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load units");
            }
        }

        fetchUnits();
    }, []);

    return (
        <div>
            <h1>Admin - Units</h1>
            <p>
                <Link to="/admin/units/create">Create New Unit</Link>
            </p>

            {units.length === 0 ? (
                <p>No units found.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Head of Unit</th>
                            <th>Member Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map((unit) => (
                            <tr key={unit.id}>
                                <td>
                                    <Link to={`/admin/units/${unit.id}/edit`}>
                                        {unit.id}
                                    </Link>
                                </td>

                                <td>{unit.name}</td>
                                <td>{unit.description || "N/A"}</td>
                                <td>{unit.head_user_name || "N/A"}</td>
                                <td>{unit.member_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UnitsListPage;
