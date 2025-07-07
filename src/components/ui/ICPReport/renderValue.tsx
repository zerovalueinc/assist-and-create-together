import React from 'react';

// Universal recursive renderer for any value (string, number, array, {key, value}[])
export function renderValue(value: any, keyPrefix = ''): React.ReactNode {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number') {
    return <span>{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    // If array of {key, value} pairs, render as definition list
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'key' in value[0] && 'value' in value[0]) {
      return (
        <dl style={{ margin: 0 }}>
          {value.map((pair, idx) => (
            <React.Fragment key={keyPrefix + pair.key + idx}>
              <dt style={{ fontWeight: 600 }}>{pair.key}:</dt>
              <dd style={{ marginLeft: 8 }}>{renderValue(pair.value, keyPrefix + pair.key + '-')}</dd>
            </React.Fragment>
          ))}
        </dl>
      );
    }
    // Otherwise, render as comma-separated badges
    return (
      <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4 }}>
        {value.map((v, idx) => (
          <span key={keyPrefix + idx} style={{ background: '#f3f4f6', borderRadius: 8, padding: '2px 8px', marginRight: 4 }}>{renderValue(v, keyPrefix + idx + '-')}</span>
        ))}
      </span>
    );
  }
  // If object, convert to pairs and render as definition list
  if (typeof value === 'object') {
    const pairs = Object.entries(value).map(([k, v]) => ({ key: k, value: v }));
    return renderValue(pairs, keyPrefix);
  }
  return null;
} 