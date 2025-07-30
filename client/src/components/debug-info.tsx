
export default function DebugInfo() {
  const isDev = import.meta.env.MODE === 'development';
  
  if (!isDev) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
      <div>Mode: {import.meta.env.MODE}</div>
      <div>API URL: {window.location.origin}</div>
      <div>Cart: {localStorage.getItem('trynex-cart')?.length || 0} chars</div>
    </div>
  );
}
