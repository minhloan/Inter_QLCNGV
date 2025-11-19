import { useEffect, useState } from 'react';
import { getCurrentUserInfo } from '../api/user';
import { getFile } from '../api/file';

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);

const useUserProfileMedia = (userId) => {
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const resolveImage = async (path) => {
      if (!path) return null;
      if (isAbsoluteUrl(path)) return path;
      try {
        return await getFile(path);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('[useUserProfileMedia] Failed to load file:', error);
        }
        return null;
      }
    };

    const fetchMedia = async () => {
      if (!userId) {
        setProfileImage(null);
        setCoverImage(null);
        setFullName('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getCurrentUserInfo();
        if (!isMounted) return;

        setFullName(
          data.full_name ||
            data.fullName ||
            [data.firstName, data.lastName].filter(Boolean).join(' ').trim() ||
            data.username ||
            data.email ||
            ''
        );

        const [avatarUrl, coverUrl] = await Promise.all([
          resolveImage(data.imageUrl),
          resolveImage(data.imageCoverUrl)
        ]);

        if (!isMounted) {
          if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
          if (coverUrl?.startsWith('blob:')) URL.revokeObjectURL(coverUrl);
          return;
        }

        setProfileImage(avatarUrl);
        setCoverImage(coverUrl);
      } catch (error) {
        if (isMounted) {
          console.error('[useUserProfileMedia] Failed to fetch profile data:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMedia();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    return () => {
      if (profileImage?.startsWith('blob:')) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  useEffect(() => {
    return () => {
      if (coverImage?.startsWith('blob:')) {
        URL.revokeObjectURL(coverImage);
      }
    };
  }, [coverImage]);

  return {
    profileImage,
    coverImage,
    fullName,
    loading
  };
};

export default useUserProfileMedia;

