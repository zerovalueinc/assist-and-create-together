import React from 'react';
import { Table } from './ui/table';

const mockContacts = [
  { name: 'Alice Johnson', email: 'alice@acme.com', company: 'Acme Corp', title: 'VP Sales', status: 'Active' },
  { name: 'Bob Smith', email: 'bob@globex.com', company: 'Globex Inc', title: 'Director Marketing', status: 'Prospect' },
  { name: 'Carol Lee', email: 'carol@initech.com', company: 'Initech', title: 'CEO', status: 'Customer' },
];

export default function CRMTableMock() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>CRM Contacts (Demo)</h2>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Title</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockContacts.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.company}</td>
              <td>{c.title}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div style={{ marginTop: 16, color: '#888' }}>
        <em>This is a mock CRM table for demo purposes only.</em>
      </div>
    </div>
  );
} 