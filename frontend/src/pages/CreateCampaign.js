import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateCampaign = () => {
  const [rules, setRules] = useState([{ field: 'totalSpend', operator: '>', value: '', id: 1 }]);
  const [logicOperator, setLogicOperator] = useState('AND');
  const [audienceSize, setAudienceSize] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('Hi {name}, here’s 10% off on your next order!');
  const navigate = useNavigate();

  const addRule = () => {
    setRules([...rules, { field: 'totalSpend', operator: '>', value: '', id: Date.now() }]);
  };

  const updateRule = (id, key, value) => {
    setRules(rules.map(rule => (rule.id === id ? { ...rule, [key]: value } : rule)));
  };

  const removeRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const buildSegmentRules = () => {
    // Simplified: only handle totalSpend and visits with > and < operators
    const segmentRules = {};
    rules.forEach(rule => {
      if (rule.field === 'totalSpend' && rule.operator === '>') {
        segmentRules.totalSpend = { gt: Number(rule.value) };
      }
      if (rule.field === 'visits' && rule.operator === '<') {
        segmentRules.visits = { lt: Number(rule.value) };
      }
    });
    return segmentRules;
  };

  const previewAudience = async () => {
    const segmentRules = buildSegmentRules();
    try {
      const response = await axios.post('http://localhost:5000/api/campaigns/preview', { segmentRules }, { withCredentials: true });
      setAudienceSize(response.data.audienceSize);
    } catch (error) {
      alert('Error fetching audience size');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const segmentRules = buildSegmentRules();
    try {
      await axios.post('http://localhost:5000/api/campaigns', {
        name: campaignName,
        segmentRules,
        messageTemplate,
      }, { withCredentials: true });
      navigate('/history');
    } catch (error) {
      alert('Error creating campaign');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create Campaign</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Campaign Name:</label>
          <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} required />
        </div>
        <div>
          <label>Audience Segmentation Rules:</label>
          {rules.map((rule) => (
            <div key={rule.id} style={{ marginBottom: '10px' }}>
              <select value={rule.field} onChange={e => updateRule(rule.id, 'field', e.target.value)}>
                <option value="totalSpend">Total Spend</option>
                <option value="visits">Visits</option>
              </select>
              <select value={rule.operator} onChange={e => updateRule(rule.id, 'operator', e.target.value)}>
                <option value=">">{'>'}</option>
                <option value="<">{'<'}</option>
              </select>
              <input type="number" value={rule.value} onChange={e => updateRule(rule.id, 'value', e.target.value)} />
              <button type="button" onClick={() => removeRule(rule.id)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addRule}>Add Rule</button>
        </div>
        <div>
          <button type="button" onClick={previewAudience}>Preview Audience Size</button>
          {audienceSize !== null && <p>Audience Size: {audienceSize}</p>}
        </div>
        <div>
          <label>Message Template:</label>
          <textarea value={messageTemplate} onChange={e => setMessageTemplate(e.target.value)} rows={4} />
        </div>
        <button type="submit">Create Campaign</button>
      </form>
    </div>
  );
};

export default CreateCampaign;
