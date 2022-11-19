import React, { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.title = "RealTime app";
  }, []);

  return (
    <div className="home">
      <div className="container">
        <p>TEST</p>
      </div>
    </div>
  );
}
