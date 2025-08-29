import React from "react";
export const MasjidCard = ({ data }) => {
    const { img_url, name, address, about, contact, location } = data;
    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLong = position.coords.longitude;
                alert(`Your Location: Lat: ${userLat}, Long: ${userLong}`);
                alert(`Masjid Location: Lat: ${location.latitude}, Long: ${location.longitude}`);
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <li className="card">
            <div>
                <img
                    src={img_url}
                    alt={name}
                    width="40%"
                    height="40%"
                />
            </div>
            <div className="card-content">
                <h2>Masjid Name: {name}</h2>
                <h3>Address: {address}</h3>
                <p>{about}</p>
                <p>Contact: {contact}</p>
                <button
                    style={{
                        padding: "1.2rem 2.4rem",
                        border: "none",
                        fontSize: "1.6rem",
                        backgroundColor: "var(--bnt-hover-bg-color)",
                        color: "var(--bg-color)",
                    }}
                    onClick={handleGetLocation}
                >
                    Get Location
                </button>
            </div>
        </li>
    );
};
