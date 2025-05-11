import React, { useEffect, useState } from 'react';
import axios from 'axios';

const History = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/campaigns/history', { withCredentials: true });
        setCampaigns(response.data);
      } catch (error) {
        alert('Error fetching campaign history');
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Campaign History</h2>
      {campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Audience Size</th>
              <th>Sent</th>
              <th>Failed</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign._id}>
                <td>{campaign.name}</td>
                <td>{campaign.deliveryStats.audienceSize}</td>
                <td>{campaign.deliveryStats.sent}</td>
                <td>{campaign.deliveryStats.failed}</td>
                <td>{new Date(campaign.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default History;
