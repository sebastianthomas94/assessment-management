import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex flex-col items-center justify-center px-container-padding">
      <span className="material-symbols-outlined text-primary text-7xl mb-6">error</span>
      <h1 className="font-headline-sm text-headline-sm text-on-surface mb-2">Page not found</h1>
      <p className="text-on-surface-variant text-body-lg mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="bg-primary text-on-primary font-label-lg text-label-lg px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
