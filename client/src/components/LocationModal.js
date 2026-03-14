import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LocationModal = ({ onClose, onSave, currentProfile }) => {
    const [address, setAddress] = useState({ street: '', city: '', state: '', pin: '' });
    const [detecting, setDetecting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentProfile) {
            setAddress({
                street: currentProfile.street || '',
                city: currentProfile.city || '',
                state: currentProfile.state || '',
                pin: currentProfile.pin || ''
            });
        }
    }, [currentProfile]);

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        setDetecting(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    
                    if (data && data.address) {
                        const addr = data.address;
                        setAddress(prev => ({
                            ...prev,
                            street: addr.road || addr.suburb || addr.neighbourhood || '',
                            city: addr.city || addr.town || addr.village || addr.county || '',
                            state: addr.state || '',
                            pin: addr.postcode || ''
                        }));
                    } else {
                        setError('Could not decode location data.');
                    }
                } catch (err) {
                    setError('Error fetching location details from coordinates.');
                } finally {
                    setDetecting(false);
                }
            },
            (err) => {
                setError('Failed to detect location. Please allow location access or map it manually.');
                setDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            // Include existing contact details to prevent overwriting them with empty values
            const payload = {
                phone: currentProfile?.phone || '',
                whatsapp: currentProfile?.whatsapp || '',
                ...address
            };

            const res = await fetch('http://localhost:3000/api/customer/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to save address');
                return;
            }

            onSave(address);
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50 text-gray-800";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span>📍</span> Set Delivery Location
                        </h2>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-5 overflow-y-auto space-y-4">
                        <button 
                            onClick={handleDetectLocation}
                            disabled={detecting}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 font-semibold py-3 px-4 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-70"
                        >
                            {detecting ? (
                                <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            {detecting ? 'Detecting Location...' : 'Detect My Location'}
                        </button>

                        <div className="flex items-center gap-3 my-2">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or enter manually</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">Street / Area / Building</label>
                                <input 
                                    className={inputCls} 
                                    placeholder="e.g. 123 Main St, Apartment 4B" 
                                    value={address.street}
                                    onChange={e => setAddress({ ...address, street: e.target.value })} 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">City</label>
                                    <input 
                                        className={inputCls} 
                                        placeholder="City" 
                                        value={address.city}
                                        onChange={e => setAddress({ ...address, city: e.target.value })} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">State</label>
                                    <input 
                                        className={inputCls} 
                                        placeholder="State" 
                                        value={address.state}
                                        onChange={e => setAddress({ ...address, state: e.target.value })} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">PIN Code</label>
                                <input 
                                    className={inputCls} 
                                    placeholder="PIN Code" 
                                    value={address.pin} 
                                    maxLength={10}
                                    onChange={e => setAddress({ ...address, pin: e.target.value })} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-t border-gray-100 bg-white">
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {saving ? 'Saving...' : 'Save Location'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LocationModal;
