import React from 'react';

export function Logo({ compact = false }) {
  return (
    <div className="logo-lockup cubrod-logo clubrod-logo" aria-label="CUBROD ชุมชนคนรถมือสอง">
      <span className="logo-mark">
        <span>C</span>
      </span>
      {!compact && (
        <span className="logo-word">
          CUB<span>ROD</span>
          <small>ชุมชนคนรถมือสอง</small>
        </span>
      )}
    </div>
  );
}

export default Logo;
