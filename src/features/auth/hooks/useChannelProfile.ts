import {useEffect, useState} from "react";
import {getTwitchChannelProfile, type TwitchChannelData} from "../utils";

export interface useChannelProfileParams {
    channel: string | null;
    accessToken: string | undefined
}

/**
 * Хук для фонового получения актуального аватара и отображаемого имени стримера.
 */
export const useChannelProfile = ({channel, accessToken}: useChannelProfileParams) => {
    const [profile, setProfile] = useState<TwitchChannelData | null>(null);

    useEffect(() => {
        if (!channel || !accessToken) {
            return;
        }

        let isMounted = true;

        const fetchProfileData = async () => {
            const channelData = await getTwitchChannelProfile(channel, accessToken);

            if (isMounted && channelData) {
                setProfile(channelData);
            }
        };

        fetchProfileData().catch((err) => console.error("useChannelProfile error:", err));

        return () => {
            isMounted = false;
        };
    }, [channel, accessToken]);

    const isProfileValid = profile && channel && profile.login === channel.toLowerCase() && accessToken;

    return {
        displayName: isProfileValid ? profile.displayName : null,
        avatarUrl: isProfileValid ? profile.profileImageUrl : null
    };
};
