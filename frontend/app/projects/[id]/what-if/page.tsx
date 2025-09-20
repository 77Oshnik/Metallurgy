import React from 'react';
import WhatIfForm from '../../../../components/WhatIf/Form';

export default function Page({ params }: { params: { id: string } }) {
  const projectId = params?.id || '';

  if (!projectId) {
    return <div style={{ padding: 24 }}>Loading project...</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>What‑If Simulations for Project {projectId}</h1>
      <p>Use this form to create scenario variations for any stage. Missing inputs are imputed by AI on the backend.</p>
      {/* @ts-ignore */}
      <WhatIfForm projectId={projectId} />
    </div>
  );
}
   
 
