import { useEffect, useState, useRef } from 'react';
import { getCurrentUserInfo } from '../api/user';
import { getFile } from '../api/file';

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);

// Module-level cache to persist across component re-renders
const profileMediaCache = new Map();
// Track ongoing fetches to prevent duplicate requests
const fetchingUsers = new Set();

const useUserProfileMedia = (userId) => {
    const [profileImage, setProfileImage] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const fetchRef = useRef(null);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const mountIdRef = useRef(0); // Track mount instances

    useEffect(() => {
        let isMounted = true;
        // Increment mount ID for this mount instance
        mountIdRef.current += 1;
        const currentMountId = mountIdRef.current;

        const resolveImage = async (path) => {
            if (!path || typeof path !== 'string' || path.trim() === '') {
                return null;
            }

            if (isAbsoluteUrl(path)) {
                return path;
            }

            // Check cache for file blob URL
            const fileCacheKey = `file_${path}`;
            if (profileMediaCache.has(fileCacheKey)) {
                return profileMediaCache.get(fileCacheKey);
            }

            try {
                const blobUrl = await getFile(path);
                if (blobUrl && typeof blobUrl === 'string') {
                    // Cache the blob URL
                    profileMediaCache.set(fileCacheKey, blobUrl);
                    return blobUrl;
                }
                return null;
            } catch (error) {
                if (error.response?.status !== 404) {
                    // Silent error: keep logic, remove logs
                }
                // Cache null to avoid repeated failed requests
                profileMediaCache.set(fileCacheKey, null);
                return null;
            }
        };

        const fetchMedia = async () => {
            // Use a default cache key if userId is not available
            // The API getCurrentUserInfo() doesn't require userId as it uses the token
            const cacheKey = userId ? `user_${userId}` : 'current_user';
            // Create unique fetch key that includes mount ID to track valid fetches
            const fetchKey = `${cacheKey}_${currentMountId}`;

            // Check cache first
            const cached = profileMediaCache.get(cacheKey);

            if (cached) {
                // Use cached data immediately
                if (isMounted) {
                    setProfileImage(cached.profileImage);
                    setCoverImage(cached.coverImage);
                    setFullName(cached.fullName);
                    setLoading(false);
                }
                return;
            }

            // Prevent multiple simultaneous fetches for the same user (use cacheKey, not fetchKey)
            if (fetchingUsers.has(cacheKey)) {
                // Wait for the ongoing fetch to complete
                intervalRef.current = setInterval(() => {
                    if (!isMounted || mountIdRef.current !== currentMountId) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        return;
                    }

                    const updatedCache = profileMediaCache.get(cacheKey);
                    if (updatedCache) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                            timeoutRef.current = null;
                        }
                        if (isMounted && mountIdRef.current === currentMountId) {
                            setProfileImage(updatedCache.profileImage);
                            setCoverImage(updatedCache.coverImage);
                            setFullName(updatedCache.fullName);
                            setLoading(false);
                        }
                    }
                }, 100);

                // Cleanup after 5 seconds
                timeoutRef.current = setTimeout(() => {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    timeoutRef.current = null;
                }, 5000);
                return;
            }

            // Prevent duplicate fetches in React StrictMode
            if (fetchRef.current === fetchKey) {
                return;
            }

            try {
                fetchingUsers.add(cacheKey); // Use cacheKey for tracking
                fetchRef.current = fetchKey; // Use fetchKey for ref tracking
                setLoading(true);

                const data = await getCurrentUserInfo();

                // Check if this fetch is still valid (component might have remounted)
                if (fetchRef.current !== fetchKey || mountIdRef.current !== currentMountId) {
                    fetchingUsers.delete(cacheKey);
                    return;
                }

                if (!isMounted) {
                    // Don't return here - we still want to cache the data
                }

                const fullNameValue =
                    data?.full_name ||
                    data?.fullName ||
                    [data?.firstName, data?.lastName].filter(Boolean).join(' ').trim() ||
                    data?.username ||
                    data?.email ||
                    '';

                // Resolve images
                const imageUrl = data?.imageUrl;
                const imageCoverUrl = data?.imageCoverUrl;

                let avatarUrl = null;
                let coverUrl = null;

                try {
                    [avatarUrl, coverUrl] = await Promise.all([
                        imageUrl ? resolveImage(imageUrl) : Promise.resolve(null),
                        imageCoverUrl ? resolveImage(imageCoverUrl) : Promise.resolve(null),
                    ]);
                } catch (imageError) {
                    // Silent error: keep logic, remove logs
                    // Continue with null values
                }

                // Cache the results (always cache, even if component unmounted)
                const cacheData = {
                    profileImage: avatarUrl,
                    coverImage: coverUrl,
                    fullName: fullNameValue,
                };
                profileMediaCache.set(cacheKey, cacheData);

                // Check again if this fetch is still valid
                if (fetchRef.current !== fetchKey || mountIdRef.current !== currentMountId) {
                    fetchingUsers.delete(cacheKey);
                    return;
                }

                // Only set state if component is still mounted AND fetch is still valid
                if (isMounted && fetchRef.current === fetchKey && mountIdRef.current === currentMountId) {
                    setProfileImage(avatarUrl);
                    setCoverImage(coverUrl);
                    setFullName(fullNameValue);
                    setLoading(false);
                }

                // Clean up (use cacheKey for fetchingUsers)
                fetchingUsers.delete(cacheKey);
                if (fetchRef.current === fetchKey) {
                    fetchRef.current = null;
                }
            } catch (error) {
                // Silent error: keep logic, remove logs
                // Only set state if component is still mounted AND fetch is still valid
                if (isMounted && fetchRef.current === fetchKey && mountIdRef.current === currentMountId) {
                    setProfileImage(null);
                    setCoverImage(null);
                    setFullName('');
                    setLoading(false);
                }
                fetchingUsers.delete(cacheKey);
                if (fetchRef.current === fetchKey) {
                    fetchRef.current = null;
                }
            }
        };

        fetchMedia();

        return () => {
            isMounted = false;
            // Reset fetchRef when userId changes or component unmounts
            const cacheKey = userId ? `user_${userId}` : 'current_user';
            const fetchKey = cacheKey;
            if (fetchRef.current === fetchKey) {
                fetchRef.current = null;
            }
            // Cleanup intervals and timeouts
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [userId]);

    return {
        profileImage,
        coverImage,
        fullName,
        loading,
    };
};

export const clearProfileMediaCache = (userId = null) => {
    if (userId) {
        // Clear cache for specific user
        const cacheKey = `user_${userId}`;
        const cached = profileMediaCache.get(cacheKey);
        if (cached) {
            // Revoke blob URLs before clearing
            if (cached.profileImage?.startsWith('blob:')) {
                URL.revokeObjectURL(cached.profileImage);
            }
            if (cached.coverImage?.startsWith('blob:')) {
                URL.revokeObjectURL(cached.coverImage);
            }
            profileMediaCache.delete(cacheKey);
        }
    } else {
        profileMediaCache.forEach((value) => {
            if (typeof value === 'object' && value !== null) {
                if (value.profileImage?.startsWith('blob:')) {
                    URL.revokeObjectURL(value.profileImage);
                }
                if (value.coverImage?.startsWith('blob:')) {
                    URL.revokeObjectURL(value.coverImage);
                }
            } else if (typeof value === 'string' && value.startsWith('blob:')) {
                URL.revokeObjectURL(value);
            }
        });
        profileMediaCache.clear();
    }
};

export default useUserProfileMedia;
