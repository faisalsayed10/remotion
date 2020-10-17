import React, {useEffect, useRef} from 'react';
import {usePlayingState} from '../timeline-position-state';
import {useCurrentFrame} from '../use-frame';
import {useVideoConfig} from '../use-video-config';
import {AllowedVideoProps} from './props';

export const VideoForDevelopment: React.FC<AllowedVideoProps> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const currentFrame = useCurrentFrame();
	const videoConfig = useVideoConfig();
	const [playing] = usePlayingState();

	useEffect(() => {
		if (playing) {
			videoRef.current?.play();
		} else {
			videoRef.current?.pause();
		}
	}, [playing]);

	useEffect(() => {
		if (!videoRef.current) {
			throw new Error('No video ref found');
		}
		if (!playing || currentFrame === 0) {
			videoRef.current.currentTime = currentFrame / (1000 / videoConfig.fps);
		}
	}, [currentFrame, playing, videoConfig.fps]);

	return <video ref={videoRef} {...props} />;
};