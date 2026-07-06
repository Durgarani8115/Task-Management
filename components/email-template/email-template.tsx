import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  taskTitle: string;
  projectName: string;
}

export function EmailTemplate({ firstName, taskTitle, projectName }: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', color: '#333' }}>
      <h2 style={{ color: '#10b981' }}>clove task management</h2>
      <p>hi {firstName},</p>
      <p>you have been assigned a new task: <strong>{taskTitle}</strong> in project <strong>{projectName}</strong>.</p>
      <p>please check your project board for details and start working on it.</p>
      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
      <p style={{ fontSize: '12px', color: '#888' }}>this is an automated notification from clove task management.</p>
    </div>
  );
}