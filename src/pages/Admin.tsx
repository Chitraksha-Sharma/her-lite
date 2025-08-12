import React from "react";

interface TileProps {
  title: string;
  subtitle: string;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({ title, subtitle, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white shadow-md rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
    >
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
};

const AdminTiles: React.FC = () => {
  // Example values - replace with real username/provider from API
  const username = "";
  const providerName = "";

  const handleUserClick = () => {
    alert(`Opening profile for user: ${username}`);
    // Here you could navigate to "/admin/users/amit.sharma"
  };

  const handleProviderClick = () => {
    alert(`Opening provider details for: ${providerName}`);
    // Here you could navigate to "/admin/providers/DOC123"
  };

  return (                                      
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      <Tile
        title="User"
        subtitle={username}
        onClick={handleUserClick}
      />
      <Tile
        title="Provider"
        subtitle={providerName}
        onClick={handleProviderClick}
      />
    </div>
  );
};

export default AdminTiles;