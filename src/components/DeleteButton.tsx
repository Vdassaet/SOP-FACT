"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteButtonProps = {
  id: string;
  endpoint: string;
  itemName: string;
  onSuccess?: () => void;
};

export default function DeleteButton({ id, endpoint, itemName, onSuccess }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmMessage = `Are you sure you want to delete this ${itemName}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/${endpoint}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting item. It might have related records preventing deletion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '0.25rem 0.75rem',
        fontSize: '0.875rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? '...' : 'Delete'}
    </button>
  );
}
