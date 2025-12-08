export default function Settings() {
  return (
    <div className="space-y-3 text-xs">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-slate-300">
        This is a placeholder Settings page. Here you can later add:
      </p>
      <ul className="list-disc list-inside text-slate-300 space-y-1">
        <li>User management (create additional admins, pastors, editors).</li>
        <li>Global configuration (church name, campuses, default settings).</li>
        <li>Integrations (email/SMS providers, Cloudinary options, etc.).</li>
      </ul>
    </div>
  );
}