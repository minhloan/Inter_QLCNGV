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
            const cacheKey = userId ? `user_${userId}` : 'current_user';
            const fetchKey = `${cacheKey}_${currentMountId}`;

            // Check cache first
            const cached = profileMediaCache.get(cacheKey);

            if (cached) {
                if (isMounted) {
                    setProfileImage(cached.profileImage);
                    setCoverImage(cached.coverImage);
                    setFullName(cached.fullName);
                    setLoading(false);
                }
                return;
            }

            if (fetchingUsers.has(cacheKey)) {
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
                fetchingUsers.add(cacheKey);
                fetchRef.current = fetchKey;
                setLoading(true);

                const data = await getCurrentUserInfo();

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
                }

                const cacheData = {
                    profileImage: avatarUrl,
                    coverImage: coverUrl,
                    fullName: fullNameValue,
                };
                profileMediaCache.set(cacheKey, cacheData);

                if (isMounted && mountIdRef.current === currentMountId) {
                    setProfileImage(avatarUrl);
                    setCoverImage(coverUrl);
                    setFullName(fullNameValue);
                    setLoading(false);
                }
                fetchingUsers.delete(cacheKey);
                if (fetchRef.current === fetchKey) {
                    fetchRef.current = null;
                }
            } catch (error) {

                const isAuthError = error?.response?.status === 401;
                
                if (isMounted && mountIdRef.current === currentMountId && !isAuthError) {
                    setProfileImage(null);
                    setCoverImage(null);
                    setFullName('');
                    setLoading(false);
                } else if (isAuthError) {
                }
                
                fetchingUsers.delete(cacheKey);
            }
        };

        fetchMedia();

        return () => {
            isMounted = false;
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
