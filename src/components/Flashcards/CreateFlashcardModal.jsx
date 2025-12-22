/**
 * FILE: src/components/Flashcards/CreateFlashcardModal.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Modal component for creating/editing flashcards - FORCED FIXED POSITION
 * STYLES: Tailwind CSS with z-[9999] to force modal above all content
 */

import { useEffect } from 'react';
import FlashcardForm from '../FlashcardForm';

function CreateFlashcardModal({
    isOpen,
    onClose,
    onSubmit,
    onTranslate,
    initialData = null,
    isEditing = false
}) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        // Close only if clicking the backdrop itself, not the modal content
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleFormSubmit = async (data) => {
        await onSubmit(data);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            }}
        >
            <div
                className="relative max-w-sm w-full max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 mx-auto"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    zIndex: 10000,
                    backgroundColor: 'rgb(15, 23, 42)',
                    border: '1px solid rgb(51, 65, 85)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(148, 163, 184, 0.1)',
                }}
            >
                <FlashcardForm
                    initialData={initialData}
                    onSubmit={handleFormSubmit}
                    onCancel={onClose}
                    onTranslate={onTranslate}
                    isEditing={isEditing}
                />
            </div>
        </div>
    );
}

export default CreateFlashcardModal;

