import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Biểu tượng marker mặc định (nếu không thêm, marker có thể bị lỗi)
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const CompanyMap = ({ lat, lng, companyName }: { lat: number; lng: number; companyName: string }) => {
    if (!lat || !lng) return <p>Không có thông tin vị trí công ty.</p>;

    return (
        <div style={{ height: "400px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                {/* Lớp nền bản đồ (nguồn từ OSM) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marker hiển thị vị trí công ty */}
                <Marker position={[lat, lng]}>
                    <Popup>{companyName}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default CompanyMap;
