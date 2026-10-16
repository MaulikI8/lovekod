import { useStore } from '../context/StoreContext';
import { SparklesIcon, AlertTriangleIcon } from './Icons';

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className={`toast show ${isError ? 'error' : 'success'}`} role="alert">
      <span className="toast-icon">
        {isError ? <AlertTriangleIcon size={18} /> : <SparklesIcon size={18} />}
      </span>
      <span className="toast-text">{toast.message}</span>
    </div>
  );
}
